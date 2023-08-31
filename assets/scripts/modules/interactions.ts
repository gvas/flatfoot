import PubSub from "./pubsub.js";

const WHEEL_SCALE_SPEEDUP = 2;
const DELTA_LINE_MULTIPLIER = 8;
const DELTA_PAGE_MULTIPLIER = 24;
const MAX_WHEEL_DELTA = 24;

function limit(delta: number, max_delta: number): number {
  return Math.sign(delta) * Math.min(max_delta, Math.abs(delta));
}

function normalizeWheel(e: WheelEvent) {
  let dx = e.deltaX;
  let dy = e.deltaY;
  if (e.shiftKey && dx === 0) {
    [dx, dy] = [dy, dx];
  }
  if (e.deltaMode === WheelEvent.DOM_DELTA_LINE) {
    dx *= DELTA_LINE_MULTIPLIER;
    dy *= DELTA_LINE_MULTIPLIER;
  } else if (e.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    dx *= DELTA_PAGE_MULTIPLIER;
    dy *= DELTA_PAGE_MULTIPLIER;
  }
  return [limit(dx, MAX_WHEEL_DELTA), limit(dy, MAX_WHEEL_DELTA)];
}

export default class Interactions {
  private readonly _pubsub: PubSub;
  private readonly _abortController: AbortController;
  private _origZoomTouches: TouchList;
  private _dragging: boolean;
  private _zooming: boolean;
  private _scale: number;
  private _timer: number;

  constructor(pubsub: PubSub, canvas: HTMLCanvasElement) {
    this._pubsub = pubsub;
    this._abortController = new AbortController();

    canvas.addEventListener("touchstart", this._onTouchStart.bind(this), {
      signal: this._abortController.signal,
      passive: false,
    });
    canvas.addEventListener("touchmove", this._onTouchMove.bind(this), {
      signal: this._abortController.signal,
      passive: false,
    });
    canvas.addEventListener("touchend", this._onTouchEnd.bind(this), {
      signal: this._abortController.signal,
      passive: false,
    });
    canvas.addEventListener("touchcancel", this._onTouchEnd.bind(this), {
      signal: this._abortController.signal,
      passive: false,
    });
    canvas.addEventListener("mousedown", this._onMouseDown.bind(this), {
      signal: this._abortController.signal,
      passive: false,
    });
    canvas.addEventListener("mousemove", this._onMouseMove.bind(this), {
      signal: this._abortController.signal,
      passive: false,
    });
    canvas.addEventListener("mouseup", this._onMouseUpOrLeave.bind(this), {
      signal: this._abortController.signal,
      passive: false,
    });
    canvas.addEventListener("mouseleave", this._onMouseUpOrLeave.bind(this), {
      signal: this._abortController.signal,
      passive: false,
    });
    canvas.addEventListener("wheel", this._onWheel.bind(this), {
      signal: this._abortController.signal,
      passive: false,
    });
  }

  destroy() {
    this._abortController.abort();
  }

  _onTouchStart(ev: TouchEvent) {
    if (ev.cancelable) {
      ev.preventDefault();
    }

    if (ev.touches.length === 1) {
      this._dragging = true;
      const touch = ev.touches.item(0);
      this._pubsub.publish({
        type: "dragStart",
        payload: {
          x: touch.clientX,
          y: touch.clientY,
        },
      });
    } else if (ev.touches.length === 2) {
      if (this._dragging) {
        this._dragging = false;
        this._pubsub.publish({
          type: "dragEnd",
        });
      }

      this._zooming = true;
      this._origZoomTouches = ev.touches;
      const touch1 = ev.touches[0];
      const touch2 = ev.touches[1];
      const midpoint = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
      };
      this._pubsub.publish({
        type: "zoomStart",
        payload: midpoint,
      });
    } else {
      if (this._dragging) {
        this._dragging = false;
        this._pubsub.publish({
          type: "dragEnd",
        });
      }
      if (this._zooming) {
        this._zooming = false;
        this._pubsub.publish({
          type: "zoomEnd",
        });
      }
    }
  }

  _onTouchMove(ev: TouchEvent) {
    if (ev.cancelable) {
      ev.preventDefault();
    }

    if (this._dragging) {
      const touch = ev.touches.item(0);
      this._pubsub.publish({
        type: "drag",
        payload: {
          x: touch.clientX,
          y: touch.clientY,
        },
      });
    } else if (this._zooming) {
      const origDistance = Math.hypot(
        this._origZoomTouches[0].clientX - this._origZoomTouches[1].clientX,
        this._origZoomTouches[0].clientY - this._origZoomTouches[1].clientY
      );
      const distance = Math.hypot(
        ev.touches[0].clientX - ev.touches[1].clientX,
        ev.touches[0].clientY - ev.touches[1].clientY
      );
      this._pubsub.publish({
        type: "zoom",
        payload: distance / origDistance,
      });
    }
  }

  _onTouchEnd(ev: TouchEvent) {
    if (ev.cancelable) {
      ev.preventDefault();
    }

    if (this._dragging) {
      this._dragging = false;
      this._pubsub.publish({
        type: "dragEnd",
      });
    } else if (this._zooming) {
      this._zooming = false;
      this._pubsub.publish({
        type: "zoomEnd",
      });
    }
  }

  _onMouseDown(ev: MouseEvent) {
    if (ev.cancelable) {
      ev.preventDefault();
    }

    this._pubsub.publish({
      type: "dragStart",
      payload: {
        x: ev.clientX,
        y: ev.clientY,
      },
    });
  }

  _onMouseMove(ev: MouseEvent) {
    if (ev.cancelable) {
      ev.preventDefault();
    }

    this._pubsub.publish({
      type: "drag",
      payload: {
        x: ev.clientX,
        y: ev.clientY,
      },
    });
  }

  _onMouseUpOrLeave(ev: MouseEvent) {
    if (ev.cancelable) {
      ev.preventDefault();
    }

    this._pubsub.publish({
      type: "dragEnd",
    });
  }

  _onWheel(ev: WheelEvent) {
    if (ev.cancelable) {
      ev.preventDefault();
    }

    if (!this._zooming) {
      this._zooming = true;
      this._scale = 1;
      this._pubsub.publish({
        type: "zoomStart",
        payload: {
          x: ev.clientX,
          y: ev.clientY,
        },
      });
    }

    let [_, dy] = normalizeWheel(ev);
    let factor =
      dy <= 0
        ? 1 - (WHEEL_SCALE_SPEEDUP * dy) / 100
        : 1 / (1 + (WHEEL_SCALE_SPEEDUP * dy) / 100);
    this._scale *= factor;
    this._pubsub.publish({
      type: "zoom",
      payload: this._scale,
    });

    if (this._timer) {
      window.clearTimeout(this._timer);
    }

    this._timer = window.setTimeout(() => {
      if (this._zooming) {
        this._zooming = false;
        this._pubsub.publish({
          type: "zoomEnd",
        });
      }
    }, 200);
  }
}

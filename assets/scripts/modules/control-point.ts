import PubSub from "./pubsub.js";

const SIZE = 5;

export default class ControlPoint {
  private readonly _pubsub: PubSub;
  private readonly _id: string;
  private readonly _abortController: AbortController;
  protected _point: DOMPoint;
  private _dragging = false;
  private _transform = new DOMMatrix();

  constructor(pubsub: PubSub, id: string, canvas: HTMLCanvasElement) {
    this._pubsub = pubsub;
    this._id = id;
    this._abortController = new AbortController();

    canvas.addEventListener("mousedown", this._onMouseDown.bind(this), {
      signal: this._abortController.signal,
    });
    canvas.addEventListener("mouseup", this._onMouseUpOrLeave.bind(this), {
      signal: this._abortController.signal,
    });
    canvas.addEventListener("mouseleave", this._onMouseUpOrLeave.bind(this), {
      signal: this._abortController.signal,
    });
    canvas.addEventListener("mousemove", this._onMouseMove.bind(this), {
      signal: this._abortController.signal,
    });

    pubsub.subscribe((message: any) => {
      switch (message.type) {
        case "transformChanged":
          this._transformChanged(message.payload);
          break;
      }
    });
  }

  _transformChanged(transform: DOMMatrix) {
    this._transform = transform;
  }

  _publishChange() {
    this._pubsub.publish({
      type: "controlPointChanged",
      payload: {
        id: this._id,
        point: this._point,
      },
    });
  }

  _adjustToBoundaries() {}

  _onMouseDown(ev: MouseEvent) {
    const canvasCoordPoint = this._transform.transformPoint(this._point);

    if (
      canvasCoordPoint.x - SIZE <= ev.clientX &&
      canvasCoordPoint.x + SIZE >= ev.clientX &&
      canvasCoordPoint.y - SIZE <= ev.clientY &&
      canvasCoordPoint.y + SIZE >= ev.clientY
    ) {
      this._dragging = true;
      this._pubsub.publishChanged();
      ev.stopImmediatePropagation();
    }
  }

  _onMouseUpOrLeave() {
    this._dragging = false;
    this._pubsub.publishChanged();
  }

  _onMouseMove(ev: MouseEvent) {
    if (!this._dragging) {
      return;
    }

    const inverseTransform = this._transform.inverse();
    this._point = inverseTransform.transformPoint(
      new DOMPoint(ev.clientX, ev.clientY)
    );
    this._adjustToBoundaries();

    this._pubsub.publish({
      type: "controlPointChanged",
      payload: {
        id: this._id,
        point: this._point,
      },
    });
    this._pubsub.publishChanged();
  }

  initialize(point: DOMPoint, boundaries: any) {
    this._point = point;
    this._publishChange();
  }

  destroy() {
    this._abortController.abort();
  }

  draw(context: CanvasRenderingContext2D) {
    context.beginPath();
    if (this._dragging) {
      context.arc(
        this._point.x,
        this._point.y,
        (SIZE + 2) / this._transform.a,
        0,
        2 * Math.PI
      );
      context.strokeStyle = "blue";
      context.lineWidth = 3 / this._transform.a;
      context.setLineDash([]);
      context.stroke();
    }else{
      context.arc(
        this._point.x,
        this._point.y,
        SIZE / this._transform.a,
        0,
        2 * Math.PI
      );
      context.fillStyle = "blue";
      context.fill();
    }
  }
}

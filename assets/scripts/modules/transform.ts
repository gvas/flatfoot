import PubSub from "./pubsub.js";

export default class Transform {
  private readonly _pubsub: PubSub;
  private readonly _canvas: HTMLCanvasElement;
  private readonly _abortController: AbortController;
  private _image: ImageBitmap;
  private _transform = new DOMMatrix();
  private _dragging = false;

  constructor(pubsub: PubSub, canvas: HTMLCanvasElement) {
    this._pubsub = pubsub;
    this._canvas = canvas;
    this._abortController = new AbortController();

    this._canvas.addEventListener("wheel", this._onWheel.bind(this), {
      signal: this._abortController.signal,
    });
    this._canvas.addEventListener("mousedown", this._onMouseDown.bind(this), {
      signal: this._abortController.signal,
    });
    this._canvas.addEventListener("mouseup", this._onMouseUp.bind(this), {
      signal: this._abortController.signal,
    });
    this._canvas.addEventListener("mousemove", this._onMouseMove.bind(this), {
      signal: this._abortController.signal,
    });

    pubsub.subscribe((message) => {
      if (message.type === "imageLoaded") {
        this._onImageLoaded(message.payload);
      }
    });
  }

  _onImageLoaded(image: ImageBitmap) {
    this._image = image;

    const scale = Math.min(
      this._canvas.clientWidth / image.width,
      this._canvas.clientHeight / image.height
    );
    const offsetX = (this._canvas.width - image.width * scale) / 2;
    const offsetY = (this._canvas.height - image.height * scale) / 2;

    this._transform = new DOMMatrix([scale, 0, 0, scale, offsetX, offsetY]);

    this._pubsub.publish({
      type: "transformChanged",
      payload: this._transform,
    });
    this._pubsub.publishChanged();
  }

  _onWheel(ev: WheelEvent) {
    ev.preventDefault();

    const scale =
      this._transform.a *
      (Math.abs(ev.deltaY) * (0.1 / 120)) ** Math.sign(ev.deltaY);
    const offsetX =
      ev.offsetX -
      ((ev.offsetX - this._transform.e) * scale) / this._transform.a;
    const offsetY =
      ev.offsetY -
      ((ev.offsetY - this._transform.f) * scale) / this._transform.a;

    this._transform = new DOMMatrix([scale, 0, 0, scale, offsetX, offsetY]);

    this._pubsub.publish({
      type: "transformChanged",
      payload: this._transform,
    });
    this._pubsub.publishChanged();
  }

  _onMouseDown() {
    this._dragging = true;
  }

  _onMouseUp() {
    this._dragging = false;
  }

  _onMouseMove(ev: MouseEvent) {
    if (!this._dragging) {
      return;
    }

    this._transform.e += ev.movementX;
    this._transform.f += ev.movementY;

    this._pubsub.publish({
      type: "transformChanged",
      payload: this._transform,
    });
    this._pubsub.publishChanged();
  }

  destroy() {
    this._abortController.abort();
  }

  draw(context: CanvasRenderingContext2D) {
    if (!this._image) {
      return;
    }

    context.setTransform(this._transform);
    context.drawImage(this._image, 0, 0);
  }
}

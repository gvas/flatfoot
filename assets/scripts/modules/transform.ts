import PubSub from "./pubsub.js";

export default class Transform {
  private readonly _pubsub: PubSub;
  private readonly _canvas: HTMLCanvasElement;
  private _image: ImageBitmap;
  private _transform = new DOMMatrix();
  private _dragging = false;
  private _dragOrigin: { x: number; y: number };
  private _zoomOrigin: { x: number; y: number };
  private _originalScale: number;

  constructor(pubsub: PubSub, canvas: HTMLCanvasElement) {
    this._pubsub = pubsub;
    this._canvas = canvas;

    pubsub.subscribe((message) => {
      switch (message.type) {
        case "imageLoaded":
          this._onImageLoaded(message.payload);
          break;

        case "zoomStart":
          this._onZoomStart(message.payload);
          break;

        case "zoom":
          this._onZoom(message.payload);
          break;

        case "dragStart":
          this._onDragStart(message.payload);
          break;

        case "drag":
          this._onDrag(message.payload);
          break;

        case "dragEnd":
          this._onDragEnd();
          break;
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

  _onZoomStart(zoomOrigin: { x: number; y: number }) {
    this._zoomOrigin = zoomOrigin;
    this._originalScale = this._transform.a;
  }

  _onZoom(scale: number) {
    const newScale = this._originalScale * scale;
    const offsetX =
      this._zoomOrigin.x -
      ((this._zoomOrigin.x - this._transform.e) * newScale) / this._transform.a;
    const offsetY =
      this._zoomOrigin.y -
      ((this._zoomOrigin.y - this._transform.f) * newScale) / this._transform.a;

    this._transform = new DOMMatrix([
      newScale,
      0,
      0,
      newScale,
      offsetX,
      offsetY,
    ]);

    this._pubsub.publish({
      type: "transformChanged",
      payload: this._transform,
    });
    this._pubsub.publishChanged();
  }

  _onDragStart({ x, y }: { x: number; y: number }) {
    this._dragging = true;
    this._dragOrigin = {
      x: x - this._transform.e,
      y: y - this._transform.f,
    };
  }

  _onDragEnd() {
    this._dragging = false;
    this._dragOrigin = null;
  }

  _onDrag({ x, y }: { x: number; y: number }) {
    if (!this._dragging) {
      return;
    }

    this._transform.e = x - this._dragOrigin.x;
    this._transform.f = y - this._dragOrigin.y;

    this._pubsub.publish({
      type: "transformChanged",
      payload: this._transform,
    });
    this._pubsub.publishChanged();
  }

  draw(context: CanvasRenderingContext2D) {
    if (!this._image) {
      return;
    }

    context.setTransform(this._transform);
    context.drawImage(this._image, 0, 0);
  }
}

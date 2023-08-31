import PubSub from "./pubsub.js";

const SIZE = 5;
const HITBOX_SIZE = 15;

export default class ControlPoint {
  private readonly _pubsub: PubSub;
  private readonly _id: string;
  protected _point: DOMPoint;
  private _dragging = false;
  private _transform = new DOMMatrix();

  constructor(pubsub: PubSub, id: string, canvas: HTMLCanvasElement) {
    this._pubsub = pubsub;
    this._id = id;

    pubsub.subscribe((message: any) => {
      switch (message.type) {
        case "transformChanged":
          this._transformChanged(message.payload);
          break;

        case "dragStart":
          return this._onDragStart(message.payload);

        case "drag":
          this._onDrag(message.payload);
          break;

        case "dragEnd":
          this._onDragEnd();
          break;
      }

      return false;
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

  _onDragStart({ x, y }: { x: number; y: number }): boolean {
    const canvasCoordPoint = this._transform.transformPoint(this._point);

    if (
      canvasCoordPoint.x - HITBOX_SIZE <= x &&
      canvasCoordPoint.x + HITBOX_SIZE >= x &&
      canvasCoordPoint.y - HITBOX_SIZE <= y &&
      canvasCoordPoint.y + HITBOX_SIZE >= y
    ) {
      this._dragging = true;
      this._pubsub.publishChanged();
      return true;
    }

    return false;
  }

  _onDragEnd() {
    this._dragging = false;
    this._pubsub.publishChanged();
  }

  _onDrag({ x, y }: { x: number; y: number }) {
    if (!this._dragging) {
      return;
    }

    const inverseTransform = this._transform.inverse();
    this._point = inverseTransform.transformPoint(new DOMPoint(x, y));
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
    } else {
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

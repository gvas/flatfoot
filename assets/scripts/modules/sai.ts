import PubSub from "./pubsub.js";

function round(num: number, decimalPlaces = 2): number {
  num = Math.round(Number(`${num}e${decimalPlaces}`));

  return Number(num + "e" + -decimalPlaces);
}

export default class SAI {
  private _A1: DOMPoint;
  private _A2: DOMPoint;
  private _B1: DOMPoint;
  private _B2: DOMPoint;
  private _transform = new DOMMatrix();
  private _boundaries: DOMRect;

  constructor(pubsub: PubSub) {
    pubsub.subscribe((message) => {
      switch (message.type) {
        case "imageLoaded":
          this._onImageLoaded(message.payload);
          break;

          case "controlPointChanged":
          this._controlPointChanged(message.payload);
          break;

        case "transformChanged":
          this._transformChanged(message.payload);
          break;
      }
    });
  }

  _onImageLoaded(image: ImageBitmap) {
    this._boundaries = new DOMRect(0, 0, image.width, image.height);
  }

  _controlPointChanged({ id, point }: { id: string; point: DOMPoint }) {
    switch (id) {
      case "A1":
        this._A1 = point;
        break;
      case "A2":
        this._A2 = point;
        break;
      case "B1":
        this._B1 = point;
        break;
      case "B2":
        this._B2 = point;
        break;
    }
  }

  _transformChanged(transform: DOMMatrix) {
    this._transform = transform;
  }

  draw(context: CanvasRenderingContext2D) {
    if (!this._A1 || !this._A2 || !this._B1 || !this._B2) {
      return;
    }

    const a = Math.sqrt(
      (this._A1.x - this._A2.x) ** 2 + (this._A1.y - this._A2.y) ** 2
    );
    const b = Math.sqrt(
      (this._B1.x - this._B2.x) ** 2 + (this._B1.y - this._B2.y) ** 2
    );

    const size = 30 / this._transform.a;
    const right = this._boundaries.width - 5 / this._transform.a;
    const top = 30 / this._transform.a;

    const sai = round(a / b);
    context.font = `bold ${size}px sans-serif`;
    context.textAlign = "right";
    context.fillText(sai.toString(), right, top);
  }
}

import PubSub from "./pubsub.js";
import Line from "./line.js";
import PerpendicularPoint from "./perpendicular-point.js";
import Segment from "./segment.js";

export default class Perpendicular {
  private readonly _pubsub: PubSub;
  private readonly _id: string;
  private readonly _points = new Array<PerpendicularPoint>();
  private _boundaries: DOMRect;
  private _segment: Segment;

  constructor(pubsub: PubSub, id: string, points: number, canvas: HTMLCanvasElement) {
    this._pubsub = pubsub;
    this._id = id;
    for (let i = 0; i < points; i++) {
      this._points.push(new PerpendicularPoint(pubsub, `${id}${i + 1}`, canvas));
    }
  }

  initialize(anchorPoint: DOMPoint, gradient: number, boundaries: DOMRect) {
    this._boundaries = boundaries;
    this._segment = Line.fromGradientAndPoint(gradient, anchorPoint).clipRect(
      boundaries
    );

    const d = Line.fromGradientAndPoint(gradient, anchorPoint).clipRect(
      boundaries
    ).length;

    for (let i = 0; i < this._points.length; i++) {
      const c = d * (i + 1) / (this._points.length + 1);
      const b = Math.sqrt(c ** 2 / (this._segment.gradient ** 2 + 1));
      const a = Math.sqrt(c ** 2 - b ** 2);
      const p = new DOMPoint(this._segment.p1.x + b, this._segment.p1.y + a);
      this._points[i].initialize(p, this._segment);
    }
  }

  updateAnchorAndGradient(anchorPoint: DOMPoint, gradient: number) {
    this._segment = Line.fromGradientAndPoint(gradient, anchorPoint).clipRect(
      this._boundaries
    );

    for (let i = 0; i < this._points.length; i++) {
      this._points[i].updateBoundaries(this._segment);
    }

    this._pubsub.publishChanged();
  }

  draw(context: CanvasRenderingContext2D) {
    if (this._segment.length === 0) {
      return;
    }

    const transform = context.getTransform();

    context.beginPath();
    context.moveTo(this._segment.x1, this._segment.y1);
    context.lineTo(this._segment.x2, this._segment.y2);
    context.lineWidth = 1 / transform.a;
    context.setLineDash([10 / transform.a, 5 / transform.a]);
    context.strokeStyle = "blue";
    context.stroke();

    for (let i = 0; i < this._points.length; i++) {
      this._points[i].draw(context);
    }
  }
}

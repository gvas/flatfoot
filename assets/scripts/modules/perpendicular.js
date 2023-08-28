import Line from "./line.js";
import PerpendicularPoint from "./perpendicular-point.js";
export default class Perpendicular {
    constructor(pubsub, id, points, canvas) {
        this._points = new Array();
        this._pubsub = pubsub;
        this._id = id;
        for (let i = 0; i < points; i++) {
            this._points.push(new PerpendicularPoint(pubsub, `${id}${i + 1}`, canvas));
        }
    }
    initialize(anchorPoint, gradient, boundaries) {
        this._boundaries = boundaries;
        this._segment = Line.fromGradientAndPoint(gradient, anchorPoint).clipRect(boundaries);
        const d = Line.fromGradientAndPoint(gradient, anchorPoint).clipRect(boundaries).length;
        for (let i = 0; i < this._points.length; i++) {
            const c = d * (i + 1) / (this._points.length + 1);
            const b = Math.sqrt(Math.pow(c, 2) / (Math.pow(this._segment.gradient, 2) + 1));
            const a = Math.sqrt(Math.pow(c, 2) - Math.pow(b, 2));
            const p = new DOMPoint(this._segment.p1.x + b, this._segment.p1.y + a);
            this._points[i].initialize(p, this._segment);
        }
    }
    updateAnchorAndGradient(anchorPoint, gradient) {
        this._segment = Line.fromGradientAndPoint(gradient, anchorPoint).clipRect(this._boundaries);
        for (let i = 0; i < this._points.length; i++) {
            this._points[i].updateBoundaries(this._segment);
        }
        this._pubsub.publishChanged();
    }
    draw(context) {
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
//# sourceMappingURL=perpendicular.js.map
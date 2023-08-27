import Line from "./line.js";
import Perpendicular from "./perpendicular.js";
import TangentPoint from "./tangent-point.js";
export default class Tangent {
    constructor(pubsub, canvas) {
        this._transform = new DOMMatrix();
        this._pubsub = pubsub;
        this._T1 = new TangentPoint(pubsub, "T1", canvas);
        this._T2 = new TangentPoint(pubsub, "B2", canvas);
        this._a = new Perpendicular(pubsub, "A", 2, canvas);
        this._b = new Perpendicular(pubsub, "B", 1, canvas);
        pubsub.subscribe((message) => {
            switch (message.type) {
                case "imageLoaded":
                    this._onImageLoaded(message.payload);
                    break;
                case "transformChanged":
                    this._transformChanged(message.payload);
                    break;
                case "controlPointChanged": {
                    this._controlPointChanged(message.payload);
                    break;
                }
            }
        });
    }
    _onImageLoaded(image) {
        this._boundaries = new DOMRect(0, 0, image.width, image.height);
        this._segment = Line
            .fromTwoPoints(image.width / 2, 0, image.width / 2, image.height)
            .clipRect(this._boundaries);
        this._a.initialize(this._segment.midpoint, -1 / this._segment.gradient, this._boundaries);
        this._b.initialize(this._segment.p2, -1 / this._segment.gradient, this._boundaries);
        this._T1.initialize(new DOMPoint(image.width / 2, image.height / 3), this._boundaries);
        this._T2.initialize(new DOMPoint(image.width / 2, image.height * 2 / 3), this._boundaries);
        this._pubsub.publishChanged();
    }
    _transformChanged(transform) {
        this._transform = transform;
        this._pubsub.publishChanged();
    }
    _controlPointChanged({ id, point }) {
        if (id === "T1") {
            this._segment.x1 = point.x;
            this._segment.y1 = point.y;
        }
        else if (id === "B2") {
            this._segment.x2 = point.x;
            this._segment.y2 = point.y;
        }
        else {
            return;
        }
        const gradient = this._segment.gradient === undefined
            ? undefined
            : -1 / this._segment.gradient;
        this._a.updateAnchorAndGradient(this._segment.midpoint, gradient);
        this._b.updateAnchorAndGradient(this._segment.p2, gradient);
        this._pubsub.publishChanged();
    }
    draw(context) {
        if (!this._segment) {
            return;
        }
        if (this._segment.gradient !== undefined) {
            const line = Line.fromTwoPoints(this._segment.x1, this._segment.y1, this._segment.x2, this._segment.y2);
            const clipped = line.clipRect(this._boundaries);
            context.beginPath();
            context.moveTo(clipped.x1, clipped.y1);
            context.lineTo(clipped.x2, clipped.y2);
            context.lineWidth = 1 / this._transform.a;
            context.strokeStyle = "blue";
            context.stroke();
        }
        this._T1.draw(context);
        this._T2.draw(context);
        this._a.draw(context);
        this._b.draw(context);
    }
}
//# sourceMappingURL=tangent.js.map
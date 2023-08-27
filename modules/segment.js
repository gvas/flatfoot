import Line from "./line.js";
export default class Segment {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }
    get midpoint() {
        return new DOMPoint((this.x1 + this.x2) / 2, (this.y1 + this.y2) / 2);
    }
    get gradient() {
        if (this.x1 === this.x2 && this.y1 === this.y2) {
            return undefined;
        }
        return (this.y2 - this.y1) / (this.x2 - this.x1);
    }
    get p1() {
        return new DOMPoint(this.x1, this.y1);
    }
    get p2() {
        return new DOMPoint(this.x2, this.y2);
    }
    get length() {
        return Math.sqrt(Math.pow((this.x2 - this.x1), 2) + Math.pow((this.y2 - this.y1), 2));
    }
    getPerpendicularBisector() {
        const midpointX = (this.x1 + this.x2) / 2;
        const midpointY = (this.y1 + this.y2) / 2;
        if (this.x1 === this.x2 && this.y1 === this.y2) {
            return null;
        }
        if (this.y1 === this.y2) {
            // horizontal segment -> vertical bisector
            return Line.fromTwoPoints(midpointX, midpointY, midpointX, midpointY + 100);
        }
        const m = (this.x1 - this.x2) / (this.y2 - this.y1);
        const b = midpointY - m * midpointX;
        return Line.fromGradientAndYIntercept(m, b);
    }
}
//# sourceMappingURL=segment.js.map
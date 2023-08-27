import Line from "./line.js";

export default class Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;

  constructor(x1: number, y1: number, x2: number, y2: number) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }

  get midpoint(): DOMPoint {
    return new DOMPoint((this.x1 + this.x2) / 2, (this.y1 + this.y2) / 2);
  }

  get gradient(): number {
    if (this.x1 === this.x2 && this.y1 === this.y2) {
        return undefined;
    }

    return (this.y2 - this.y1) / (this.x2 - this.x1);
  }

  get p1(): DOMPoint {
    return new DOMPoint(this.x1, this.y1);
  }

  get p2(): DOMPoint {
    return new DOMPoint(this.x2, this.y2);
  }

  get length(): number {
    return Math.sqrt((this.x2 - this.x1) ** 2 + (this.y2 - this.y1) ** 2);
  }

  getPerpendicularBisector(): Line {
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

import Segment from "./segment.js";

export default class Line {
  // ax + by = c
  private _a: number;
  private _b: number;
  private _c: number;

  public static fromStandardForm(a: number, b: number, c: number) {
    const line = new Line();

    line._a = a;
    line._b = b;
    line._c = c;

    return line;
  }

  public static fromGradientAndYIntercept(m: number, b: number) {
    // y = mx + b
    const line = new Line();

    line._a = -m;
    line._b = 1;
    line._c = b;

    return line;
  }

  public static fromGradientAndPoint(m: number, p: DOMPoint) {
    const line = new Line();

    line._a = -m;
    line._b = 1;
    line._c = line._a * p.x + line._b * p.y;

    return line;
  }

  public static fromTwoPoints(x1: number, y1: number, x2: number, y2: number) {
    if (x1 === x2 && y1 === y2) {
      throw Error("The two points are the same.");
    }

    const line = new Line();
    if (x1 === x2) {
      // vertical line
      line._a = 1;
      line._b = 0;
      line._c = x1;
    } else {
      line._a = (y1 - y2) / (x2 - x1);
      line._b = 1;
      line._c = y1 - ((y2 - y1) / (x2 - x1)) * x1;
    }
    return line;
  }

  public static fromSegment(segment: Segment) {
    return Line.fromTwoPoints(segment.x1, segment.y1, segment.x2, segment.y2);
  }

  get gradient() {
    return -this._a;
  }

  get yIntercept() {
    return this._c;
  }

  solveForX(y: number): number {
    if (this._a === 0) {
      // horizontal line
      return undefined;
    }

    return (this._c - this._b * y) / this._a;
  }

  solveForY(x: number): number {
    if (this._b === 0) {
      // vertical line
      return undefined;
    }

    return this._c - this._a * x + this._b;
  }

  clipRect(rect: DOMRect): Segment {
    if (this._a === 0) {
      // horizontal line
      return new Segment(rect.left, this._c, rect.right, this._c);
    }

    if (this._b === 0) {
      // vertical line
      return new Segment(this._c, rect.top, this._c, rect.bottom);
    }

    let sx1 = rect.left;
    let sy1 = this.solveForY(sx1);
    if (sy1 < rect.top) {
      sy1 = rect.top;
      sx1 = this.solveForX(sy1);
    } else if (sy1 > rect.bottom) {
      sy1 = rect.bottom;
      sx1 = this.solveForX(sy1);
    }

    let sx2 = rect.right;
    let sy2 = this.solveForY(sx2);
    if (sy2 < rect.top) {
      sy2 = rect.top;
      sx2 = this.solveForX(sy2);
    } else if (sy2 > rect.bottom) {
      sy2 = rect.bottom;
      sx2 = this.solveForX(sy2);
    }

    return new Segment(sx1, sy1, sx2, sy2);
  }

  getProjection(p: DOMPoint): DOMPoint {
    const projX =
      (p.x + this.gradient * p.y - this.gradient * this.yIntercept) /
      (1 + this.gradient ** 2);
    const projY =
      (this.gradient * p.x + this.gradient ** 2 * p.y + this.yIntercept) /
      (1 + this.gradient ** 2);

    return new DOMPoint(projX, projY);
  }
}

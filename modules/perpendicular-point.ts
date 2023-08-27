import ControlPoint from "./control-point.js";
import Line from "./line.js";
import Segment from "./segment.js";

export default class PerpendicularPoint extends ControlPoint {
  private _boundaries: Segment;

  _adjustToBoundaries() {
    const b1 = this._boundaries.p1;
    const b2 = this._boundaries.p2;
    const line = Line.fromTwoPoints(b1.x, b1.y, b2.x, b2.y);
    this._point = line.getProjection(this._point);

    if (
      this._point.x < b1.x && this._point.x < b2.x ||
      this._point.x > b1.x && this._point.x > b2.x ||
      this._point.y < b1.y  && this._point.y < b2.y ||
      this._point.y > b1.y  && this._point.y > b2.y
    ) {
      const distanceToP1 = Math.sqrt(
        (this._point.x - b1.x) ** 2 + (this._point.y - b1.y) ** 2
      );
      const distanceToP2 = Math.sqrt(
        (this._point.x - b2.x) ** 2 + (this._point.y - b2.y) ** 2
      );
      if (distanceToP1 < distanceToP2) {
        this._point = b1;
      } else {
        this._point = b2;
      }
    }
  }

  initialize(point: DOMPoint, boundaries: Segment) {
    this._boundaries = boundaries;
    super.initialize(point, boundaries);
  }

  updateBoundaries(boundaries: Segment) {
    this._boundaries = boundaries;
    this._adjustToBoundaries();
    this._publishChange();
  }
}

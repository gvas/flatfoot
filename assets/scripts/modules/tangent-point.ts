import ControlPoint from "./control-point.js";

export default class TangentPoint extends ControlPoint {
  private _boundaries: DOMRect;

  _adjustToBoundaries() {
    if (this._point.x < this._boundaries.left) {
      this._point.x = this._boundaries.left;
    } else if (this._point.x > this._boundaries.right) {
      this._point.x = this._boundaries.right;
    }

    if (this._point.y < this._boundaries.top) {
      this._point.y = this._boundaries.top;
    } else if (this._point.y > this._boundaries.bottom) {
      this._point.y = this._boundaries.bottom;
    }
  }

  initialize(point: DOMPoint, boundaries: DOMRect) {
    this._boundaries = boundaries;
    super.initialize(point, boundaries);
  }
}

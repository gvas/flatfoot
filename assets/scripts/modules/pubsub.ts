export default class PubSub {
  private readonly _subscribers = new Array<Function>();

  constructor() {
    this._subscribers = [];
  }

  subscribe(subscriber: Function) {
    this._subscribers.push(subscriber);
  }

  unsubscribe(subscriber: Function) {
    const idx = this._subscribers.indexOf(subscriber);
    if (idx >= 0) {
      this._subscribers.splice(idx, 1);
    }
  }

  publish(payload: any) {
    for (const subscriber of this._subscribers) {
      if (subscriber(payload)) {
        break;
      }
    }
  }

  publishChanged() {
    this.publish({ type: "changed" });
  }
}

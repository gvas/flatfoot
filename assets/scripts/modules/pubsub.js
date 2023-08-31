export default class PubSub {
    constructor() {
        this._subscribers = new Array();
        this._subscribers = [];
    }
    subscribe(subscriber) {
        this._subscribers.push(subscriber);
    }
    unsubscribe(subscriber) {
        const idx = this._subscribers.indexOf(subscriber);
        if (idx >= 0) {
            this._subscribers.splice(idx, 1);
        }
    }
    publish(payload) {
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
//# sourceMappingURL=pubsub.js.map
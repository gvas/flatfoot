import Transform from "./modules/transform.js";
import PubSub from "./modules/pubsub.js";
import Tangent from "./modules/tangent.js";
import SAI from "./modules/sai.js";
import FileInput from "./modules/file-input.js";

const container = document.querySelector("#container");
const canvas = document.querySelector("#container > canvas");
const resizeObserver = new ResizeObserver((entries) => {
  canvas.height = entries[0].contentRect.height;
  canvas.width = entries[0].contentRect.width;
  pubsub.publishChanged();
});
resizeObserver.observe(container);

document.getElementById("save").addEventListener("click", (ev) => {
  ev.currentTarget.href = canvas.toDataURL();
});

const context = canvas.getContext("2d");

const pubsub = new PubSub();
const tangent = new Tangent(pubsub, canvas);
const transform = new Transform(pubsub, canvas);
const fileInput = new FileInput(pubsub);
const sai = new SAI(pubsub);

let changed = false;
pubsub.subscribe((message) => {
  if (message.type === "changed") {
    changed = true;
    window.requestAnimationFrame(draw);
  }
});

function draw() {
  context.reset();

  transform.draw(context);
  tangent.draw(context);
  sai.draw(context);

  changed = false;
}

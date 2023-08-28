import PubSub from "./pubsub.js";

export default class FileInput {
  constructor(pubsub: PubSub) {
    const input: HTMLInputElement = document.querySelector("input[type=file]");
    input.addEventListener("change", () => {
      reader.readAsDataURL(input.files[0]);
    });

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      imageElement.src = <string>reader.result;
    });

    const imageElement = new Image();
    imageElement.addEventListener("load", async () => {
      input.value = null;

      const image = await createImageBitmap(imageElement);
      pubsub.publish({
        type: "imageLoaded",
        payload: image,
      });
    });
  }
}

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export default class FileInput {
    constructor(pubsub) {
        const input = document.querySelector("input[type=file]");
        input.addEventListener("change", () => {
            reader.readAsDataURL(input.files[0]);
        });
        const reader = new FileReader();
        reader.addEventListener("load", () => {
            imageElement.src = reader.result;
        });
        const imageElement = new Image();
        imageElement.addEventListener("load", () => __awaiter(this, void 0, void 0, function* () {
            document.getElementById("intro").style.display = "none";
            input.value = null;
            const image = yield createImageBitmap(imageElement);
            pubsub.publish({
                type: "imageLoaded",
                payload: image,
            });
        }));
    }
}
//# sourceMappingURL=file-input.js.map
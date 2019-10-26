import Prompt from "@Environment/Library/DOM/elements/prompt"
import { Preloader } from "@Environment/Library/DOM/object"

export default function loadingPopup() {
    return Prompt({
        text: new Preloader({}),
        popupSettings: {
            fullWidth: false,
            noClose: true,
        },
    })
}

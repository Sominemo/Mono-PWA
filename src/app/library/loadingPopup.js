import Prompt from "@Environment/Library/DOM/elements/prompt"
import { Preloader } from "@Environment/Library/DOM/object"

export default function loadingPopup() {
    return Prompt({
        text: new Preloader({}),
        pureText: true,
        popupSettings: {
            fullWidth: false,
            noClose: true,
            cardStyle: { padding: "2.5vmin" },
        },
        cardAdditional: { noPadding: true },
    })
}

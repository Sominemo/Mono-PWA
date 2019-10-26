import Toast from "@Environment/Library/DOM/elements/toast"
import { $$ } from "@Core/Services/Language/handler"

export default function reloadToast() {
    Toast.add($$("@settings/restart_to_apply"), 0, {
        buttons: [
            {
                content: $$("@settings/actions/restart"),
                handler() {
                    window.location.reload()
                },
            },
        ],
    })
}

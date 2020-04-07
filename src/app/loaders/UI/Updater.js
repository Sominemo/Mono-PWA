import SW from "@Core/Services/SW"
import { Padding } from "@Environment/Library/DOM/style"
import { $$ } from "@Core/Services/Language/handler"
import Toast from "@Environment/Library/DOM/elements/toast"
import { CoreLoader } from "@Core/Init/CoreLoader"
import Prompt from "@Environment/Library/DOM/elements/prompt"

async function userPrompt() {
    Toast.add(new Padding($$("settings/updates/ready"), 15), 5000, {
        buttons: [
            {
                async handler() {
                    Prompt({
                        title: $$("settings/updates/new_update"),
                        centredTitle: true,
                        buttons: [
                            {
                                content: $$("settings/updates/later"),
                                handler: "close",
                                type: ["light"],
                            },
                            { content: $$("settings/updates/restart_now"), handler() { window.location.reload() } },
                        ],
                    })
                },
                content: $$("settings/updates/tell_more"),
            },
        ],
    })
}

CoreLoader.registerTask({
    id: "sw-updater",
    presence: "Register update handler",
    task() {
        SW.userPrompt = userPrompt
    },
})

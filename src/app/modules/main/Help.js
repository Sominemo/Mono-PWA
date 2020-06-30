import Prompt from "@Environment/Library/DOM/elements/prompt"
import { $$ } from "@Core/Services/Language/handler"

export default class Help {
    static open(link) {
        Prompt({
            title: "Help",
            text: `Help for /${link} to be done`,
            buttons: [
                {
                    content: $$("close"),
                    handler: "close",
                },
            ],
        })
    }
}

import { $$ } from "@Core/Services/Language/handler"
import Help from "@App/modules/main/Help"
import DOM from "@DOMPath/DOM/Classes/dom"
import ObjectWidget from "./ObjectWidjet"

export default class HelpCard {
    constructor(content = []) {
        return new ObjectWidget(
            [
                {
                    type: "title",
                    content: $$("help"),
                },
                {
                    type: "text",
                    content: content.map((e) => new DOM({
                        new: "div",
                        class: "help-list-link",
                        content: $$(`help/articles/${e.name}`),
                        events: [
                            {
                                event: "click",
                                handler() {
                                    Help.open(e.link)
                                },
                            },
                        ],
                    })),
                },
            ],
            { width: 2, style: { background: "#ECEFF1" }, classes: ["mobile-only-block"] },
        )
    }
}

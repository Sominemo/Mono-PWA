import DOM from "@DOMPath/DOM/Classes/dom"
import { Title } from "@Environment/Library/DOM/object"

export default class SettingsSectionElement {
    constructor(options, object) {
        return new DOM({
            new: "div",
            class: ["settings-section-chunk"],
            content: [
                ...("name" in options ? [new Title(options.name, 2)] : []),
            ],
        })
    }
}

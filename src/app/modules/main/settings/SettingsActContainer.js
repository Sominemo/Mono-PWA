import DOM from "@DOMPath/DOM/Classes/dom"
import FieldsContainer from "@Core/Tools/validation/fieldsContainer"
import FieldChecker from "@Core/Tools/validation/fieldChecker"
import { Title } from "@Environment/Library/DOM/object"

export default class SettingsActContainer {
    constructor(data, object) {
        new FieldsContainer([
            ["name"],
            {
                name: new FieldChecker({ type: "string" }),
            },
        ]).set(data)

        return new DOM({
            new: "div",
            class: ["settings-act-container"],
            content: [
                new Title(data.name),
            ],
            ...(data.lock ? {
                style: { pointerEvents: "none", opacity: 0.7 },
            } : {}),
            onRender(p, e) {
            },
        })
    }
}

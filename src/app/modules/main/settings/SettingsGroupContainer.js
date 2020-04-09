import DOM from "@DOMPath/DOM/Classes/dom"
import FieldsContainer from "@Core/Tools/validation/fieldsContainer"
import FieldChecker from "@Core/Tools/validation/fieldChecker"
import { Title } from "@Environment/Library/DOM/object"

export default class SettingsGroupContainer {
    constructor(options, object) {
        new FieldsContainer([[], {
            name: new FieldChecker({ type: "string" }),
        }]).set(options)

        return new DOM({
            new: "div",
            class: ["card", "settings-group-chunk", ...("type" in options ? options.type : [])],
            content: [
                ...("name" in options ? [new Title(options.name, 3)] : []),
            ],
        })
    }
}

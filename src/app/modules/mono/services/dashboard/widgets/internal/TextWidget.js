import Block from "@Environment/Library/DOM/elements/block"
import DOM from "@DOMPath/DOM/Classes/dom"
import objectGenerator, { localize } from "../../cards/funcs/objectGenerator"

export default class TextWidget {
    constructor(
        {
            data: {
                content = [],
                params: {
                    icon = "dashboard", name = "Text", size: { x = 3, y = 2 } = {}, style = {},
                } = {},
            } = {},
        } = {},
    ) {
        return new Block({
            // eslint-disable-next-line prefer-rest-params
            data: arguments[0],
            icon,
            name: localize(name),
            size: { x, y },
            render() {
                return {
                    content: new DOM({
                        new: "div",
                        content: objectGenerator(content),
                    }),
                    style,
                }
            },
        })
    }
}

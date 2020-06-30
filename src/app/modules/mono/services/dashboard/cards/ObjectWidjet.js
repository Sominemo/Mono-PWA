import DOM from "@DOMPath/DOM/Classes/dom"
import objectGenerator from "./funcs/objectGenerator"

export default class ObjectWidget {
    constructor(content, {
        size = 1, width = 4, style = {}, classes = [],
    } = {}) {
        const cont = objectGenerator(content)

        return new DOM({
            new: "modern-block",
            class: classes,
            content: [
                new DOM({
                    new: "modern-block-body",
                    content: cont,
                    style,
                }),
            ],
            objectProperty: [
                {
                    name: "size",
                    get() {
                        const l = this.controller.limit
                        return {
                            y: size,
                            x: (width > 3
                                ? (l === null || l >= width + 2 ? width : 3) : width),
                        }
                    },
                },
            ],
        })
    }
}

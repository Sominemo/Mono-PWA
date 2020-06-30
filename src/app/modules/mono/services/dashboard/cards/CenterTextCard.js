import DOM from "@DOMPath/DOM/Classes/dom"

export default class CenterTextCard {
    constructor(content, {
        height = 1, width = 1, style = {}, contentStyle = {}, events = [],
    } = {}) {
        return new DOM({
            new: "modern-block",
            style,
            content: [
                new DOM({
                    new: "modern-block-body",
                    content,
                    style: {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        padding: "1em",
                        ...contentStyle,
                    },
                    events,
                }),
            ],
        })
    }
}

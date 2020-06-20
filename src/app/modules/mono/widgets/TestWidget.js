import Block from "@Environment/Library/DOM/elements/block"
import DOM from "@DOMPath/DOM/Classes/dom"

export default class TestWidget {
    constructor() {
        return new Block({
            data: [{ type: "clients" }],
            colors: { main: "#9C27B0", light: "#E1BEE7" },
            icon: "settings",
            name: "Test Block",
            size: { x: 2, y: 1 },
            render() {
                return {
                    content: new DOM({
                        new: "div",
                        content: "Hello world!",
                    }),
                    style: {
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                    },
                    shadow: [156, 39, 176],
                }
            },
        })
    }
}

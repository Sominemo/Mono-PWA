import DOM from "@DOMPath/DOM/Classes/dom"
import { Card } from "@Environment/Library/DOM/object/card"
import { Title, Icon } from "@Environment/Library/DOM/object"
import { SVG } from "@Environment/Library/DOM/basic"
import { $$ } from "@Core/Services/Language/handler"

export default class Tip {
    constructor({
        text = $$("hint"),
        title = "Заголовок",
        sub = "Пояснювальний текст",
        side = null,
        icon = null,
        onclick = null,
        context = null,
    }) {
        return new Card(
            [
                new DOM({
                    new: "div",
                    style: {
                        display: "flex",
                        width: "100%",
                    },
                    content: [
                        new DOM({
                            new: "div",
                            style: {
                                display: "flex",
                                flexDirection: "column",
                                padding: "10px 15px",
                            },
                            content: [
                                new DOM({
                                    new: "div",
                                    content: [
                                        new SVG(require("@Resources/images/vector/lightbulb-outline.svg"), { height: "1.2em", paddingRight: "10px" }),
                                        new DOM({
                                            new: "div",
                                            content: text,
                                            style: {
                                                color: "var(--color-warning-info)",
                                                fontWeight: "500",
                                            },
                                        }),
                                    ],
                                    style: {
                                        display: "flex",
                                        alignItems: "center",
                                        paddingBottom: "5px",
                                    },
                                }),
                                new DOM({
                                    new: "div",
                                    content: [
                                        new Title(title, 2, { margin: 0 }),
                                        new DOM({
                                            new: "div",
                                            content: sub,
                                            style: { opacity: ".5" },
                                        }),
                                    ],
                                    style: {
                                        margin: "auto",
                                    },
                                }),
                            ],
                        }),
                        new DOM({
                            new: "div",
                            style: {
                                display: "flex",
                                flexGrow: "1",
                            },
                            content: side
                                || new Icon(icon, {
                                    marginLeft: "auto",
                                    paddingRight: ".5em",
                                    fontSize: "3em",
                                    alignSelf: "center",
                                    color: "var(--color-warning-info)",
                                }),
                        }),
                    ],
                }),
            ],
            { type: ["warn", "tip", ...(onclick || context ? ["card-list-item-clickable"] : [])], style: { position: "relative", minHeight: "120px", display: "flex" } },
            {
                events: [
                    ...(onclick ? [{
                        event: "click",
                        handler: onclick,
                    }] : []),
                    ...(context ? [{
                        event: "contextmenu",
                        handler: context,
                    }] : []),
                ],
            },
        )
    }
}

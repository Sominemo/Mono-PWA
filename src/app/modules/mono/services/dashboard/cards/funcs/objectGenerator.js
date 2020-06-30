import DOM from "@DOMPath/DOM/Classes/dom"
import { Icon } from "@Environment/Library/DOM/object"
import { $ } from "@Core/Services/Language/handler"
import Design from "@Core/Services/design"
import { Button } from "@Environment/Library/DOM/object/input"
import LiteralActions from "./LiteralActions"

export function localize(e) {
    if (typeof e !== "object") return e
    if ("" in e && e[""] === "loc") return $(e.value)
    return e
}

export function color(e) {
    if (typeof e !== "object") return e
    if ("" in e && e[""] === "var") return Design.getVar(e.value, true)
    return e
}

export function button(b) {
    return new Button({
        type: ["modern"],
        content: localize(b.content),
        handler(...a) {
            return LiteralActions.execute(b.handler.name, a, b.handler.params || [])
        },
        style: {
            ...(b.color ? { "--button-main-color": color(b.color) } : {}),
        },
    })
}

export default function objectGenerator(content) {
    return content.map((e) => {
        if (e.type === "text") {
            return new DOM({
                new: "div",
                class: "modern-object-box",
                content: localize(e.content),
            })
        }

        if (e.type === "title") {
            return new DOM({
                new: "div",
                class: "modern-object-title",
                content: localize(e.content),
            })
        }

        if (e.type === "icon") {
            const {
                color: colorRAW, icon, content: innerContent, subcontent,
            } = e
            const clickable = e.clickable || false
            const events = e.events || []
            const useColor = color(colorRAW)

            return new DOM({
                new: "div",
                class: ["modern-object-icon-box", ...(clickable ? ["clickable"] : [])],
                content: [
                    new DOM({
                        new: "div",
                        class: "modern-object-icon-box-left",
                        content: [
                            new DOM({
                                new: "div",
                                class: "icon-circle",
                                content: new Icon(icon, { color: `rgb(${useColor})` }),
                                style: {
                                    background: `rgba(${useColor}, .15)`,
                                },
                            }),
                        ],
                    }),
                    new DOM({
                        new: "div",
                        class: "modern-object-icon-box-right",
                        content: [
                            new DOM({
                                new: "div",
                                class: "modern-icon-box-content",
                                content: localize(innerContent),
                            }),
                            ...(
                                subcontent
                                    ? [
                                        new DOM({
                                            new: "div",
                                            class: "modern-icon-box-subcontent",
                                            content: localize(subcontent),
                                        }),
                                    ]
                                    : []
                            ),
                        ],
                    }),
                ],
                events: events.map((el) => (
                    {
                        ...el,
                        handler(...a) {
                            if (typeof el.handler === "function") return el.handler()
                            return LiteralActions.execute(el.handler.name, a, el.handler.params)
                        },
                    })),
            })
        }

        if (e.type === "button") {
            const left = e.content.left || []
            const right = e.content.right || []
            const center = e.content.center || []
            const lbc = new DOM({
                new: "div",
                class: "block-buttons-container",
                style: {
                    marginRight: "auto",
                },
                content: left.map(button),
            })
            const cbc = new DOM({
                new: "div",
                class: "block-buttons-container",
                style: {
                    marginRight: "auto",
                    marginLeft: "auto",
                },
                content: center.map(button),
            })
            const rbc = new DOM({
                new: "div",
                class: "block-buttons-container",
                style: {
                    marginLeft: "auto",
                },
                content: right.map(button),
            })
            return new DOM({
                new: "div",
                class: "block-buttons-flex-container",
                content: [lbc, cbc, rbc],
            })
        }

        return ""
    })
}

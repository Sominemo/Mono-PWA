import Block from "@Environment/Library/DOM/elements/block"
import DOM from "@DOMPath/DOM/Classes/dom"
import { $$ } from "@Core/Services/Language/handler"
import Navigation from "@Core/Services/navigation"
import { Icon } from "@Environment/Library/DOM/object"
import hexToRgb from "@Core/Tools/transformation/text/hexToRgb"
import SetupFramework from "../../setup/SetupFramework"
import objectGenerator from "../../cards/funcs/objectGenerator"
import SetupError from "../../setup/SetupError"

export default class NavWidget {
    static table = {
        settings: {
            icon: "settings",
            sign: "settings/tile_name",
            colors: { main: "#607D8B", light: "#b0bec5" },
        },
        statement: {
            icon: "account_balance_wallet",
            sign: "statement",
            colors: { main: "#3f51b5", light: "#9fa8da" },
        },
        partners: {
            icon: "store",
            sign: "p4",
            colors: { main: "#607D8B", light: "#b0bec5" },
        },
        currency: {
            icon: "assessment",
            sign: "currency",
            colors: { main: "#4caf50", light: "#a5d6a7" },
        },
    }

    constructor({ data: { link: { module, params = {} } } }) {
        const cur = this.constructor.table[module]
        if (!cur) return new Error("Unsupported link")

        return new Block({
            data: [],
            colors: cur.colors,
            icon: cur.icon,
            name: $$(cur.sign),
            size: { x: 1, y: 1 },
            render() {
                return {
                    content: [
                        new Icon(cur.icon, { fontSize: "3.5em", color: cur.colors.main, margin: "10% auto auto auto" }),
                        new DOM({
                            new: "div",
                            class: ["modern-mini-title"],
                            style: {
                                color: cur.colors.main,
                            },
                            content: $$(cur.sign),
                        }),
                    ],
                    style: {
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                        cursor: "pointer",
                        flexDirection: "column",
                    },
                    shadow: cur.colors.main,
                    events: [
                        {
                            event: "click",
                            handler() {
                                Navigation.url = { module, params }
                            },
                        },
                    ],
                }
            },
        })
    }

    static icon = "link"

    static name = $$("dashboard/nav")

    static setup({ checkFit }) {
        return new SetupFramework({
            name: this.name,
            func: (data, state) => {
                if (!checkFit(1, 1)) throw new SetupError("Widget won't fit")
                if (!data.link) {
                    let res
                    const next = () => new Promise((resolve) => { res = resolve })
                    const ui = objectGenerator(
                        Array.from(Object.entries(this.table)).map(([key, e]) => ({
                            type: "icon",
                            icon: e.icon,
                            color: hexToRgb(e.colors.main, { array: true }).join(","),
                            content: $$(e.sign),
                            clickable: true,
                            events: [
                                {
                                    event: "click",
                                    handler() { data.link = { module: key }; res() },
                                },
                            ],
                        })),
                    )

                    return {
                        comment: $$("dashboard/nav/choose_link"),
                        next,
                        ui,
                    }
                }
                return {}
            },
        }, checkFit)
    }
}

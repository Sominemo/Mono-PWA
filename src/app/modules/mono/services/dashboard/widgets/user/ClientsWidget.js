import Block from "@Environment/Library/DOM/elements/block"
import DOM from "@DOMPath/DOM/Classes/dom"
import { $$, $ } from "@Core/Services/Language/handler"
import moneySpacing from "@App/tools/transform/moneySpacing"
import Toast from "@Environment/Library/DOM/elements/toast"
import { SVG } from "@Environment/Library/DOM/basic"
import { Icon } from "@Environment/Library/DOM/object"
import drawGraph from "@App/modules/mono/functions/drawGraph"
import hexToRgb from "@Core/Tools/transformation/text/hexToRgb"
import SetupFramework from "../../setup/SetupFramework"
import SetupError from "../../setup/SetupError"

const redColors = { main: "#f44336", light: "#ef9a9a", dark: "#d32f2f" }
const greenColors = { main: "#51BF7D", light: "#95eab7", dark: "#52996E" }

export default class ClientsWidget {
    constructor({ data: { type } }) {
        if (type === "simple") {
            return new Block({
                request: [{ scope: "clients" }],
                colors: redColors,
                icon: "people",
                name: $$("dashboard/clients"),
                size: { x: 2, y: 1 },
                render(el, data) {
                    return {
                        content: [
                            new DOM({
                                new: "div",
                                content: [
                                    new DOM({
                                        new: "div",
                                        class: ["modern-mini-title"],
                                        content: $("dashboard/clients/sign"),
                                        style: {
                                            margin: "0",
                                            fontSize: "1.6em",
                                        },
                                    }),
                                    new DOM({
                                        new: "div",
                                        class: ["modern-mini-title"],
                                        style: {
                                            color: redColors.main,
                                            margin: "0",
                                            fontSize: "3em",
                                        },
                                        content: moneySpacing(String(data[0].count)),
                                    }),
                                ],
                            }),
                        ],
                        style: {
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "column",
                        },
                        shadow: redColors.main,
                    }
                },
            })
        }
        if (type === "graph") {
            return new Block({
                request: [{ scope: "clients", request: "graph" }],
                icon: "people",
                name: $$("dashboard/clients"),
                size: { x: 3, y: 2 },
                render(el, data) {
                    const deltaMax = Math.max(...data[0].history)
                    const perc = data[0].history.map((e) => Math.floor((e / deltaMax) * 100))
                    const curColors = (data[0].delta >= 0 ? greenColors : redColors)
                    return {
                        content: [
                            new DOM({
                                new: "div",
                                content: [
                                    new DOM({
                                        new: "div",
                                        class: ["modern-mini-title"],
                                        content: $("dashboard/clients"),
                                        style: {
                                            margin: "0",
                                            fontSize: "1.6em",
                                        },
                                    }),
                                    new DOM({
                                        new: "div",
                                        class: ["modern-mini-title"],
                                        style: {
                                            color: curColors.main,
                                            margin: "0",
                                            fontSize: "3em",
                                        },
                                        content: moneySpacing(String(data[0].count)),
                                    }),
                                    new DOM({
                                        new: "div",
                                        style: {
                                            color: curColors.dark,
                                            fontSize: "1.5em",
                                            display: "flex",
                                            alignItems: "center",
                                        },
                                        content: [
                                            new Icon(
                                                (data[0].delta > 0
                                                    ? "arrow_upward"
                                                    : (data[0].delta < 0 ? "arrow_downward" : "arrow_forward")),
                                                {
                                                    fontSize: "1em",
                                                    marginRight: ".25em",
                                                },
                                            ),
                                            String(Math.abs(data[0].delta)),
                                        ],
                                    }),
                                ],
                            }),
                            drawGraph({
                                color: hexToRgb(curColors.main, { array: true }).join(","),
                                data: perc,
                                style: {
                                    position: "absolute",
                                    bottom: "0",
                                    left: "0",
                                    height: "40%",
                                    width: "100%",
                                },
                            }),
                        ],
                        style: {
                            display: "flex",
                            flexDirection: "column",
                            padding: "1.5em",
                        },
                        shadow: curColors.main,
                    }
                },
            })
        }
        return new Error("Unknown widget type")
    }

    static icon = "people"

    static name = $$("dashboard/clients")

    static setup({ checkFit }) {
        return new SetupFramework({
            func(data, state) {
                if (!("step" in state)) {
                    state.step = 1
                    let res
                    const next = () => new Promise((resolve) => { res = resolve })
                    const ui = [
                        new DOM({
                            new: "div",
                            class: "setup-choose-size-container",
                            content: [
                                new DOM({
                                    new: "div",
                                    class: "setup-choose-size-card",
                                    style: { flexGrow: "2" },
                                    content: [
                                        new SVG(require("@Resources/images/vector/widgets/ClientsCount/small.svg")),
                                        new DOM({
                                            new: "div",
                                            content: "2 x 1",
                                        }),
                                    ],
                                    events: [{ event: "click", handler() { data.type = "simple"; res() } }],
                                }),
                                new DOM({
                                    new: "div",
                                    class: "setup-choose-size-card",
                                    style: { flexGrow: "3" },
                                    content: [
                                        new SVG(require("@Resources/images/vector/widgets/ClientsCount/big.svg")),
                                        new DOM({
                                            new: "div",
                                            content: "3 x 2",
                                        }),
                                    ],
                                    events: [{ event: "click", handler() { data.type = "graph"; res() } }],
                                }),
                            ],
                        }),
                    ]
                    return {
                        ui,
                        next,
                        comment: $$("dashboard/clients/choose_type"),
                    }
                }
                if (!checkFit(2, 1)) {
                    Toast.add($$("dashboard/cant_fit"))
                    throw new SetupError("This widget doesn't fit")
                }
                return {}
            },
            name: this.name,
        }, checkFit)
    }
}

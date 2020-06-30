/* eslint-disable max-len */
import DOM from "@DOMPath/DOM/Classes/dom"
import hexToRgb from "@Core/Tools/transformation/text/hexToRgb"
import ModernBlocks from "@Environment/Library/DOM/buildBlock/modernBlocks"
import { ContextMenu } from "@Environment/Library/DOM/elements"
import { $$ } from "@Core/Services/Language/handler"
import { Report } from "@Core/Services/Report"
import DashboardCore from "./DashboardCore"
import CenterTextCard from "./cards/CenterTextCard"
import DashboardAdd from "./DashboardAdd"
import SetupError from "./setup/SetupError"

export default class DashboardEditor {
    constructor() {
        const self = this
        this.container = new DOM({
            new: "div",
            class: "dashboard-editor-cont",
            onRendered() {
                self.render(this)
            },
        })
        const fbind = () => {
            this.render()
        }
        this.scroller = new DOM({
            new: "div",
            class: "dashboard-editor-scroller",
            content: this.container,
            onRendered() {
                window.addEventListener("resize", fbind, { passive: true })
            },
            onClear() {
                window.removeEventListener("resize", fbind, { passive: true })
            },
        })
        return this.scroller
    }

    plusRow() {
        this.y++
        this.render()
    }

    plusColumn() {
        this.x++
        this.render()
    }

    x = 3

    y = 2

    clipboard = { x: 0, y: 0 }

    clipboardStyle = {
        filter: "brightness(0)",
        transform: "scale(.9)",
        borderRadius: "1.5vmin",
    }

    layoutWithSizes(l) {
        return l.map((e) => ({ ...e, sizeX: e.item.size.x, sizeY: e.item.size.y }))
    }

    async render() {
        const self = this
        const l = await DashboardCore.getLayout()
        const visual = []
        l.forEach((e) => {
            const newX = e.x + e.item.size.x - 1
            if (newX > this.x) this.x = newX

            const newY = e.y + e.item.size.y - 1
            if (newY > this.y) this.y = newY

            const colorMain = hexToRgb(e.item.colors.main, { array: true }).join(",")
            const clipboarded = () => e.x === self.clipboard.x && e.y === self.clipboard.y
            visual.push(new CenterTextCard(e.item.name, {
                height: e.item.size.y,
                width: e.item.size.x,
                contentStyle: {
                    background: `rgba(${colorMain}, .07)`,
                    color: `rgb(${colorMain})`,
                    ...(clipboarded()
                        ? self.clipboardStyle : {}),
                },
                style: {
                    "--shadow-block-color": colorMain,
                    gridColumnStart: e.x,
                    gridRowStart: e.y,
                    gridColumnEnd: `span ${e.item.size.x}`,
                    gridRowEnd: `span ${e.item.size.y}`,
                    border: `${clipboarded() ? "dashed" : "solid"} rgba(${colorMain}, .5) .2vmin`,
                    cursor: "pointer",
                },
                events: [
                    {
                        event: "click",
                        handler(ev, cur) {
                            ContextMenu({
                                event: ev,
                                content: [
                                    {
                                        type: "item",
                                        title: $$("dashboard/settings/actions/delete"),
                                        icon: "delete",
                                        async handler() {
                                            const i = l
                                                .findIndex((el) => (el && el.x === e.x && el.y === e.y))
                                            if (i === -1) return
                                            delete l[i]
                                            if (self.clipboard.x === e.x
                                                && self.clipboard.y === e.y) {
                                                self.clipboard = { x: 0, y: 0 }
                                            }
                                            await DashboardCore.setLayout(l)
                                            self.render()
                                        },
                                    },
                                    {
                                        type: "item",
                                        title: $$("dashboard/settings/actions/cut"),
                                        icon: "cut",
                                        handler() {
                                            self.clipboard = { x: e.x, y: e.y }
                                            self.render()
                                        },
                                        disabled: clipboarded,
                                    },
                                    { type: "delimeter" },
                                    {
                                        type: "item",
                                        title: $$("dashboard/settings/actions/add_column"),
                                        icon: "arrow_forward",
                                        handler() { self.plusColumn() },
                                    },
                                    {
                                        type: "item",
                                        title: $$("dashboard/settings/actions/add_row"),
                                        icon: "arrow_downward",
                                        handler() { self.plusRow() },
                                    },
                                ],
                            })
                        },
                    },
                ],
            }))
        })

        const m = new ModernBlocks({ useClass: true })
        Object.defineProperty(m, "limit", { value: this.x })
        m.x = this.x
        m.y = this.y
        const lay = this.layoutWithSizes(l)
        const map = m.takenMap(lay)
        for (let curY = 1; curY <= this.y; curY++) {
            for (let curX = 1; curX <= this.x; curX++) {
                if (!(curY in map) || !(curX in map[curY])) {
                    visual.push(
                        new DOM({
                            new: "modern-block",
                            style: {
                                opacity: ".8",
                                gridColumnStart: curX,
                                gridRowStart: curY,
                                gridColumnEnd: "span 1",
                                gridRowEnd: "span 1",
                                cursor: "pointer",
                            },
                            events: [
                                {
                                    event: "click",
                                    handler(ev) {
                                        ContextMenu({
                                            event: ev,
                                            content: [
                                                {
                                                    type: "item",
                                                    title: $$("dashboard/settings/actions/add"),
                                                    icon: "add",
                                                    async handler() {
                                                        try {
                                                            const data = await DashboardAdd(
                                                                {
                                                                    checkFit(x, y) {
                                                                        return m.checkFit({
                                                                            sizeX: x, sizeY: y, x: curX, y: curY,
                                                                        }, map, null)
                                                                    },

                                                                },
                                                            )
                                                            l.push({
                                                                item: data.builder,
                                                                x: curX,
                                                                y: curY,
                                                                data: data.data,
                                                            })
                                                            await DashboardCore.setLayout(l)
                                                            self.render()
                                                        } catch (e) {
                                                            if (!(e instanceof SetupError)) throw e
                                                        }
                                                    },
                                                },
                                                {
                                                    type: "item",
                                                    title: $$("dashboard/settings/actions/paste"),
                                                    icon: "paste",
                                                    disabled() {
                                                        try {
                                                            if (self.clipboard.x === 0
                                                                || self.clipboard.y === 0) return true
                                                            const cind = map[self.clipboard.y][self.clipboard.x]
                                                            if (!m.checkFit({ ...lay[cind], x: curX, y: curY }, map, null, { x: lay[cind].x, y: lay[cind].y })) return true
                                                        } catch (e) {
                                                            Report.write(e, "error")
                                                        }
                                                        return false
                                                    },
                                                    async handler() {
                                                        const cind = map[self.clipboard.y][self.clipboard.x]
                                                        l[cind].x = curX
                                                        l[cind].y = curY
                                                        self.clipboard = { x: 0, y: 0 }

                                                        await DashboardCore.setLayout(l)
                                                        self.render()
                                                    },
                                                },
                                                { type: "delimeter" },
                                                {
                                                    type: "item",
                                                    title: $$("dashboard/settings/actions/add_column"),
                                                    icon: "arrow_forward",
                                                    handler() { self.plusColumn() },
                                                },
                                                {
                                                    type: "item",
                                                    title: $$("dashboard/settings/actions/add_row"),
                                                    icon: "arrow_downward",
                                                    handler() { self.plusRow() },
                                                },
                                            ],
                                        })
                                    },
                                },
                            ],
                        }),
                    )
                }
            }
        }

        this.container.style({
            gridTemplateColumns: `repeat(${this.x}, var(--size-card-side))`,
            gridTemplateRows: `repeat(${this.y}, var(--size-card-side))`,
        })
        this.container.clear(...visual)

        if (this.scroller.elementParse.native.scrollWidth
            > this.scroller.elementParse.native.clientWidth) {
            this.scroller.style({
                cursor: "w-resize",
            })
            this.scroller.elementParse.native.addEventListener("mousedown", this.startListener, { passive: true })
            this.scroller.elementParse.native.addEventListener("touchstart", this.startTouchListener, { passive: true })
        } else {
            this.scroller.style({
                cursor: "",
            })
            this.scroller.elementParse.native.removeEventListener("mousedown", this.startListener, { passive: true })
            this.scroller.elementParse.native.removeEventListener("touchstart", this.startTouchListener, { passive: true })
        }
    }

    movementListener = (ev) => {
        this.scroller.elementParse.native.scrollBy({ left: -ev.movementX })
    }

    endListener = (ev) => {
        window.removeEventListener("mouseup", this.endListener, { passive: true })
        window.removeEventListener("mousemove", this.movementListener, { passive: true })
    }

    startListener = () => {
        window.addEventListener("mouseup", this.endListener, { passive: true })
        window.addEventListener("mousemove", this.movementListener, { passive: true })
    }

    touchX = 0

    movementTouchListener = (ev) => {
        this.scroller.elementParse.native.scrollBy(
            {
                left: (this.touchX - ev.changedTouches[0].clientX),
            },
        )
        this.touchX = ev.changedTouches[0].clientX
    }

    endTouchListener = (ev) => {
        window.removeEventListener("mouseup", this.endTouchListener, { passive: true })
        window.removeEventListener("mousemove", this.movementTouchListener, { passive: true })
    }

    startTouchListener = (ev) => {
        this.touchX = ev.changedTouches[0].clientX
        window.addEventListener("touchend", this.endTouchListener, { passive: true })
        window.addEventListener("touchmove", this.movementTouchListener, { passive: true })
    }
}

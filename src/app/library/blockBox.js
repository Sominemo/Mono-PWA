import { Popup } from "@Environment/Library/DOM/elements"
import WindowManager from "@Core/Services/SimpleWindowManager"
import Design from "@Core/Services/design"
import DOM from "@DOMPath/DOM/Classes/dom"

export default class BlockBox {
    constructor(content) {
        const o = WindowManager.newOverlay()
        const p = new Popup(new DOM({ new: "div", style: { display: "flex", flexDirection: "column", height: "100%" }, content }),
            {
                control: o,
                fixedContext: true,
                noClose: true,
                fullWidth: true,
                fullHeight: true,
                cardStyle: {
                    borderRadius: "0",
                    margin: 0,
                    background: Design.getVar("color-accent-dark"),
                },
            })
        o.append(p)
        o.element.style({ backdropFilter: "blur(5px)" })
        return p
    }
}

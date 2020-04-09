import DOM from "@DOMPath/DOM/Classes/dom"
import ucFirst from "@Core/Tools/transformation/text/ucFirst"
import Navigation from "@Core/Services/navigation"
import { CardList } from "@Environment/Library/DOM/object/card"
import { TwoSidesWrapper, Icon } from "@Environment/Library/DOM/object"

export default class SettingsActLink {
    constructor([act, sign, custom = false, disabled = false]) {
        if (typeof act === "string") act = [act]
        sign = sign || (typeof act === "string" ? ucFirst(act[0]) : "(...)")
        const signElement = new DOM({ new: "div", content: sign })
        return new CardList([
            {
                content: new TwoSidesWrapper(signElement, new Icon((custom || "chevron_right"), { marginLeft: "15px" })),
                handler: (typeof act === "function"
                    ? act
                    : () => { Navigation.url = { module: "settings", params: act } }),
                object: [
                    {
                        name: "changeSign",
                        handler(n) { signElement.clear(n) },
                    },
                ],
                ...(disabled ? { style: { opacity: "0.4" } } : {}),
            },
        ], true)
    }
}

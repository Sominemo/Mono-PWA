import { Nav, Scaffold } from "@Environment/Library/DOM/buildBlock"
import Navigation from "@Core/Services/navigation"
import { $$ } from "@Core/Services/Language/handler"
import { ContextMenu, ContextMenuElement } from "@Environment/Library/DOM/elements"

Nav.navListFunction = (function navListFunction() {
    const current = Navigation.Current
    const custom = current.navMenu || []

    return [
        ...(Object.keys(custom).length > 0 && this.constantNavMenu.length > 0 ? [...custom, { type: "delimeter" }] : []),
        ...this.constantNavMenu,
    ]
}).bind(Nav)

Nav.navigationList = Nav.navListFunction

Nav.Toggle = function toggle(_, ev) {
    ev.stopPropagation()
    ContextMenuElement.closeAll()
    ContextMenu({
        content: this.navigationList(),
        event: ev,
    })
}

Nav.constantNavMenu = [
    {
        icon: "settings",
        title: $$("settings"),
        handler() {
            Navigation.url = { module: "settings" }
        },
    },
]

Scaffold.enableAccessibilitySign = $$("enable_accessibility")
Scaffold.skipNavSign = $$("skip_nav")

import { Nav, Scaffold } from "@Environment/Library/DOM/buildBlock"
import Navigation from "@Core/Services/navigation"
import { $$ } from "@Core/Services/Language/handler"

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

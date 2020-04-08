import { Nav } from "@Environment/Library/DOM/buildBlock"
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
    {
        icon: "info",
        title: $$("about/app"),
        handler() {
            Navigation.url = { module: "about" }
        },
    },

]

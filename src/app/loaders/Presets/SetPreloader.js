import { Preloader } from "@Environment/Library/DOM/object"
import { SVG } from "@Environment/Library/DOM/basic"

Preloader.setPreloader(({
    size, style,
} = {}) => new SVG(require("@Resources/images/vector/mono.svg"), { height: "12vmin" }))

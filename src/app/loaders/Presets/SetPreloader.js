import { Preloader } from "@Environment/Library/DOM/object"
import LottieAnimation from "@App/library/LottieAnimation"

Preloader.setPreloader(({
    size, style,
} = {}) => new LottieAnimation(require("@Resources/animations/loader.json"), { size, style }))

import Lottie from "lottie-web"
import DOM from "@DOMPath/DOM/Classes/dom"

export default class LottieAnimation {
    constructor(source, {
        lottieOptions = {}, style = {}, size = null, destroy = true,
    } = {}) {
        let animation

        const container = new DOM({
            new: "div",
            style: {
                width: (typeof size === "number" ? `${size}px` : size),
                ...style,
            },
            onClear() {
                if (destroy) {
                    animation.destroy()
                } else {
                    animation.stop()
                }
            },
            onRender() {
                animation.play()
            },
        })

        animation = Lottie.loadAnimation(
            {
                container: container.elementParse.native,
                renderer: "svg",
                loop: true,
                animationData: source,
                ...lottieOptions,
            },
        )

        return container
    }
}

import DOM from "@DOMPath/DOM/Classes/dom"
import delayAction from "@Core/Tools/objects/delayAction"

export default function drawGraph({ data, color, style }) {
    let growth = null
    let candidate = data[0]
    const orig = data.map((e) => e)
    data = []
    orig.forEach((e, i) => {
        if (i === 0) return
        const curGrowth = e - orig[i - 1] > 0
        if (growth !== curGrowth) {
            data.push(candidate)
            growth = curGrowth
            candidate = e
        } else if ((growth && e > candidate) || (!growth && e < candidate)) candidate = e
    })
    data.push(candidate)
    if (candidate !== orig[orig.length - 1]) data.push(orig[orig.length - 1])

    const canvasDOM = new DOM({ new: "canvas", style })
    const canvas = canvasDOM.elementParse.native

    const ctx = canvas.getContext("2d")
    function round(num) {
        const full = Number.parseInt(num, 10)
        const small = num - full
        if (small >= 0.33 && small <= 66) return full + 0.5
        if (small < 0.33) return full
        return full + 1
    }

    function draw() {
        const { innerHeight: winHeight, innerWidth: winWidth } = window
        const maxWin = Math.max(winHeight, winWidth) / 100
        const minWin = Math.min(winHeight, winWidth) / 100
        const crisp = Math.min(round(maxWin), 4)
        const line = 2

        let { clientHeight, clientWidth } = canvas
        clientWidth *= crisp
        clientHeight *= crisp

        canvas.width = clientWidth
        canvas.height = clientHeight

        ctx.clearRect(0, 0, clientWidth, clientHeight)

        ctx.lineWidth = line * minWin
        ctx.strokeStyle = `rgb(${color})`
        ctx.lineCap = "square"
        ctx.lineJoin = "round"

        const path = []
        let maxHeight = 0
        let lastX = null
        let lastY = null
        for (let index = 0; index < data.length; index++) {
            const element = data[index]
            const height = round(clientHeight + ctx.lineWidth - ((clientHeight / 100) * element))
            if (height > maxHeight) maxHeight = clientHeight - height
            const x = round(((clientWidth) / (data.length - 1)) * index)
            const y = round(height)
            if (index === 0) {
                path.push(`M ${round(((clientWidth) / (data.length - 1)) * index)} ${round(height)}`)
            } else if (index === 1 || lastY > y) {
                if (!((lastY - y) / clientHeight >= 0.3)) { path.push(`Q ${(lastX + x) / 2} ${(lastY + y) / 2} ${x} ${y}`) } else path.push(`T ${x} ${y}`)
            } else {
                path.push(`T ${x} ${y}`)
            }
            lastX = x
            lastY = y
        }

        const lineargradient = ctx.createLinearGradient(
            0, clientHeight - maxHeight,
            0, clientHeight,
        )
        lineargradient.addColorStop(0, `rgb(${color})`)
        lineargradient.addColorStop(1, `rgba(${color}, .25)`)
        ctx.fillStyle = lineargradient

        const pb = new Path2D(`${path.join(" ")} L ${clientWidth} ${clientHeight} L 0 ${clientHeight} Z`)
        ctx.fill(pb)
        const p = new Path2D(path.join(" "))
        ctx.stroke(p)
    }

    canvasDOM.onEvent("rendered", () => {
        window.addEventListener("resize", draw, { passive: true })
        delayAction(draw)
    })
    canvasDOM.onEvent("clear", () => {
        window.removeEventListener("resize", draw, { passive: true })
    })

    return canvasDOM
}

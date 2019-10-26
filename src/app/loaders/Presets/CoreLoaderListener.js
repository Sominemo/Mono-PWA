import Report from "@Core/Services/report"
import { CoreLoader } from "@Core/Init/CoreLoader"
import CriticalLoadErrorListener from "@Core/Services/CriticalLoadErrorListener"

const states = [
    [
        { badge: "DONE", color: "#4caf50", text: "#ffffff" },
        { badge: "SKIP", color: "#0095ff;", text: "#ffffff" },
    ],
    [
        { badge: "STOP", color: "#f44336", text: "#ffffff" },
    ],
    [
        { badge: "WARN", color: "#ff9800", text: "#ffffff" },
    ],
]

CoreLoader.addDoneListener((loaded) => {
    if (loaded.result === false) return
    const out = []
    const current = states[loaded.result.state][loaded.result.type]
    out.push(`%c ${current.badge} %c ${loaded.name}${(loaded.result.answer && loaded.result.answer !== true ? `: ${String(loaded.result.answer)}` : "")}`, `background: ${current.color}; color:${current.text}`, "")
    if (loaded.result.data) out.push(loaded.result.data)
    Report.writeNoTrace(...out)
    if (loaded.result.state === 1) {
        CriticalLoadErrorListener.listener(loaded.result.data || `${loaded.name}: ${loaded.result.answer}`, false)
    }
})

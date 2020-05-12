import { CoreLoader } from "@Core/Init/CoreLoader"
import CriticalLoadErrorListener from "@Core/Services/CriticalLoadErrorListener"
import { Report } from "@Core/Services/Report"

const states = [
    [
        { badge: "done" },
        { badge: "skip" },
    ],
    [
        { badge: "stop" },
    ],
    [
        { badge: "warn" },
    ],
]

CoreLoader.addDoneListener((loaded) => {
    if (loaded.result === false) return
    const out = []
    const current = states[loaded.result.state][loaded.result.type]

    if (loaded.result.data) out.push(loaded.result.data)

    Report.add([`${loaded.name}${(loaded.result.answer && loaded.result.answer !== true ? `: ${String(loaded.result.answer)}` : "")}`, ...out], [`core.${current.badge}`])
    if (loaded.result.state === 1) {
        CriticalLoadErrorListener.listener(loaded.result.data || `${loaded.name}: ${loaded.result.answer}`, false)
    }
})

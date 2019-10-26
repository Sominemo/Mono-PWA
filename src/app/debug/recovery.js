import { CoreLoader, CoreLoaderResult, CoreLoaderSkip } from "@Core/Init/CoreLoader"

/* eslint-disable no-alert */

let recovery = false
const recoveryModeHash = "#recoveryMode"

let overlay = null
let ready = false

CoreLoader.registerTask({
    id: "recovery",
    presence: "Recovery detection",
    task() {
        if (window.location.hash === recoveryModeHash) {
            recovery = true
            return new CoreLoaderResult("Recovery inited")
        }
        return new CoreLoaderSkip()
    },
})

function isRecoveryMode() {
    return !!recovery
}

function OutputRecovery(...data) {
    if (!isRecoveryMode() || !overlay) return

    if (!document.getElementById("--core-recovery-log") && ready) document.body.appendChild(overlay)
    data.reverse().forEach((e) => {
        const el = document.createElement("pre")
        el.innerText = JSON.stringify(e)
        overlay.insertBefore(el, overlay.firstChild)
    })
}

if (isRecoveryMode()) {
    try {
        overlay = document.createElement("div")
        overlay.id = "--core-recovery-log"
        overlay.style.zIndex = 99999
        overlay.style.padding = "10px"
        overlay.style.position = "fixed"
        overlay.style.top = "0"
        overlay.style.left = "0"
        overlay.style.width = "100%"
        overlay.style.height = "100%"
        overlay.style.display = "block"
        overlay.style.background = "white"
        overlay.style.overflow = "auto"
        overlay.style.userSelect = "all"
        overlay.oncontextmenu = (e) => { e.preventDefault(); document.body.removeChild(overlay) }
        overlay.onclick = () => { document.execCommand("copy") }
        window.addEventListener("load", () => { ready = true; document.body.appendChild(overlay) })

        console.log("Recovery mode called", overlay)
    } catch (e) {
        alert("Failed to initiate Recovery Mode")
        alert(JSON.stringify(e))
    }

    window.addEventListener("error", (e) => {
        OutputRecovery((e.message ? `${e.message} on ${e.filename}:${e.lineno}:${e.colno}` : "ERROR: No debug info available"))
    })
}

export {
    OutputRecovery,
    isRecoveryMode,
    recoveryModeHash,
}

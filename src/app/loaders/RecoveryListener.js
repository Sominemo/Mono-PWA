import { recoveryModeHash, isRecoveryMode, OutputRecovery } from "@App/debug/recovery"
import { $$ } from "@Core/Services/Language/handler"
import Toast from "@Environment/Library/DOM/elements/toast"

export default function recoveryListener() {
    if (window.location.hash === recoveryModeHash) {
        if (!isRecoveryMode()) Toast.add($$("@recovery_mode/enter"))
        else OutputRecovery("Recovery Log called")
    }
}
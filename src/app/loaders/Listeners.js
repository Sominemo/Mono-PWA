import Listeners from "@Core/Services/Listeners"
import recoveryListener from "./RecoveryListener"

Listeners.add(window, "hashchange", recoveryListener)

import Listeners from "@Core/Services/Listeners"
import recoveryListener from "./RecoveryListener"
import crossMessenger from "./CrossMessenger"

Listeners.add(window, "load", crossMessenger)
Listeners.add(window, "hashchange", recoveryListener)

/* global __PACKAGE_ANALYTICS */

import "./SettingsDefaults"
import "./Accessibility"
import "./Listeners"
import "./testDB"
import "./Modules"

if (__PACKAGE_ANALYTICS) {
    require("./Analytics")
}

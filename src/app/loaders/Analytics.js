/* eslint-disable prefer-rest-params */
/* eslint-disable no-inner-declarations */
/* global __PACKAGE_ANALYTICS */

import {
    CoreLoader, CoreLoaderResult, CoreLoaderWarning, CoreLoaderSkip,
} from "@Core/Init/CoreLoader"
import SettingsStorage from "@Core/Services/Settings/SettingsStorage"
import PWA from "@App/modules/main/PWA"


SettingsStorage.getFlag("deny_analytics").then((ev) => {
    PWA.analyticsDenyCache = ev
    CoreLoader.registerTask({
        id: "analytics",
        presence: "Analytics",
        async: true,
        alwaysResolve: true,
        async task() {
            if (!PWA.analyticsAllowed) return new CoreLoaderSkip("Forbidden by user")
            try {
                const script = window.document.createElement("script")
                script.src = `https://www.googletagmanager.com/gtag/js?id=${__PACKAGE_ANALYTICS}`
                script.async = true
                document.head.appendChild(script)

                window.dataLayer = window.dataLayer || []
                function gtag() { window.dataLayer.push(arguments) }
                window.gtag = gtag
                gtag("js", new Date())

                gtag("config", __PACKAGE_ANALYTICS)
                return new CoreLoaderResult("GA inited")
            } catch (e) {
                throw new CoreLoaderWarning("Failed to init GA", e)
            }
        },
    })
})

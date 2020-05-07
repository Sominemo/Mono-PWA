import { Report, ReportLogger, ReportStorage } from "@Core/Services/Report"
import errorToObject from "@Core/Tools/transformation/object/errorToObject"
import PWA from "@App/modules/main/PWA"
import DBUserPresence from "@Core/Services/DBUserPresence"

const beaconsAllowed = (
    PWA.isWG
    || localStorage.getItem("beacon_error_reports") !== "0"
)

if (beaconsAllowed) {
    Report.newHook((report) => {
        if (report.level >= 3) {
            navigator.sendBeacon("https://sominemo.com/mono/help/report/beacon",
                JSON.stringify(
                    {
                        log: errorToObject(report.log),
                        v: `${PWA.version}/${PWA.branch}/${PWA.buildDate}`,
                    },
                ))
        }
    }, "errorReporting")
}

const autosendAllowed = (
    PWA.isWG
    || localStorage.getItem("reports_auto_sending") === "1"
)

if (autosendAllowed) {
    Report.newHook((report) => {
        if (report.level >= 3) {
            DBUserPresence.get("ReportData").functions.find((e) => e.name === "send").handler(report.log)
                .then(() => {
                    Report.add("Report sent", ["report.storage"])
                })
        }
    }, "reportAutoSend")
}

const extendedLoggingAllowed = (
    PWA.buildFlag("local")
    || localStorage.getItem("reports_extended_logging") === "1"
)

if (extendedLoggingAllowed) {
    ReportLogger.loggingLevel = -2
    ReportStorage.loggingLevel = -2
}

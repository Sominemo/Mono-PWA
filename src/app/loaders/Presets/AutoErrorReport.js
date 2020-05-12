import { Report, ReportLogger, ReportStorage } from "@Core/Services/Report"
import errorToObject from "@Core/Tools/transformation/object/errorToObject"
import PWA from "@App/modules/main/PWA"
import delayAction from "@Core/Tools/objects/delayAction"
import Axios from "axios"

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
            delayAction(async () => {
                try {
                    let db = []
                    try {
                        db = JSON.stringify(
                            await ReportStorage.export(),
                        )
                    } catch (er) {
                        // Ignore error
                    }

                    const log = {
                        error: errorToObject(report.log),
                        report: db,
                        v: `${PWA.version}/${PWA.branch}/${PWA.buildDate}`,
                    }

                    await Axios({
                        method: "post",
                        url: "https://sominemo.com/mono/help/report/beacon",
                        data: log,
                    })
                } catch (e) {
                    console.error("Report send error", e)
                }
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

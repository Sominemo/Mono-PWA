/* global __PACKAGE_ANALYTICS */
import { SettingsSectionElement, SettingsGroupContainer } from "@App/modules/main/settings"
import { $$ } from "@Core/Services/Language/handler"
import FlagsUI from "@App/modules/main/flags"
import PWA from "@App/modules/main/PWA"
import DOM from "@DOMPath/DOM/Classes/dom"

export default function generatePrivacyLayout(act) {
    const sectionNameAnalytics = "privacy-analytics"
    const groupNameAnalytics = "privacy-analytics-group"

    const sectionAnalytics = act.createSection({
        id: sectionNameAnalytics,
        options: {
            name: $$("settings/privacy/analytics"),
        },
        dom: SettingsSectionElement,
        display: () => true || __PACKAGE_ANALYTICS,
    }).getSection(sectionNameAnalytics)

    const analyticsGroup = sectionAnalytics.createGroup({
        id: groupNameAnalytics,
        options: {},
        dom: SettingsGroupContainer,
    }).getGroup(groupNameAnalytics)

    const sectionNameReports = "privacy-reports"
    const groupNameReports = "privacy-reports-group"

    const sectionReports = act.createSection({
        id: sectionNameReports,
        options: {
            name: $$("settings/privacy/reports"),
        },
        dom: SettingsSectionElement,
    }).getSection(sectionNameReports)

    const reportsGroup = sectionReports.createGroup({
        id: groupNameReports,
        options: {},
        dom: () => new DOM({ new: "div" }),
    }).getGroup(groupNameReports)

    analyticsGroup.createItem({
        id: "privacy-analytics-control",
        options: {},
        dom() {
            return FlagsUI.renderSwitch(null, null, "deny_analytics", { showID: false, locked: PWA.isWG })
        },
    })

    reportsGroup.createItem({
        id: "privacy-reports-send-errors",
        options: {},
        dom() {
            return FlagsUI.renderSwitch(
                $$("settings/privacy/send_errors"),
                $$("settings/privacy/send_errors/info"),
                "beacon_error_reports",
                {
                    ls: true, showID: false, lsDefault: 1, locked: PWA.isWG,
                },
            )
        },
    })
    reportsGroup.createItem({
        id: "privacy-reports-send-reports",
        options: {},
        dom() {
            return FlagsUI.renderSwitch(
                $$("settings/privacy/send_reports"),
                $$("settings/privacy/send_reports/info"),
                "reports_auto_sending",
                {
                    ls: true, showID: false, lsDefault: PWA.debug, locked: PWA.isWG,
                },
            )
        },
    })
    reportsGroup.createItem({
        id: "privacy-reports-extended-logging",
        options: {},
        dom() {
            return FlagsUI.renderSwitch(
                $$("settings/privacy/debug_log"),
                $$("settings/privacy/debug_log/info"),
                "reports_extended_logging",
                {
                    ls: true, showID: false, lsDefault: PWA.buildFlag("local"),
                },
            )
        },
    })
}

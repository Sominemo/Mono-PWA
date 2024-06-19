/* global __PACKAGE_ANALYTICS */
import { SettingsSectionElement, SettingsGroupContainer, SettingsActLink } from "@App/modules/main/settings"
import { $$ } from "@Core/Services/Language/handler"
import FlagsUI from "@App/modules/main/flags"
import PWA from "@App/modules/main/PWA"
import DOM from "@DOMPath/DOM/Classes/dom"
import StatementStorage from "@App/modules/mono/services/StatementStorage"
import Auth from "@App/modules/mono/services/Auth"
import MonoCorpAPI from "@App/modules/mono/API/clients/MonoCorpAPI"
import WarningConstructorButton from "@Environment/Library/DOM/object/warnings/WarningConstructorButton"
import WarningConstructor from "@Environment/Library/DOM/object/warnings/WarningConstructor"
import { Card, CardList } from "@Environment/Library/DOM/object/card"
import Prompt from "@Environment/Library/DOM/elements/prompt"
import loadingPopup from "@App/library/loadingPopup"
import Toast from "@Environment/Library/DOM/elements/toast"
import SlideOut from "@Environment/Library/Animations/slideOut"
import EaseOutCubic from "@DOMPath/Animation/Library/Timing/easeOutCubic"

export default function generatePrivacyLayout(act) {
    act.createSection({ id: "privacy-policy-section", dom: SettingsSectionElement, options: {} })
        .getSection("privacy-policy-section")
        .createGroup({ id: "privacy-policy-group", dom: SettingsGroupContainer, options: {} })
        .getGroup("privacy-policy-group")
        .createItem({
            id: "privacy-policy-card", options: {}, dom: () => new Card(new CardList(
                [
                    {
                        content: new SettingsActLink([
                            () => PWA.privacyPolicy(),
                            $$("about/privacy_policy")]),
                        disableWrapper: true,
                    },
                ],
            )),
        }
        );

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

    const sectionNameDeleteData = "privacy-delete-data"
    const groupNameDeleteData = "privacy-delete-data-group"

    const sectionDeleteData = act.createSection({
        id: sectionNameDeleteData,
        options: {
            name: $$("settings/privacy/delete_data"),
        },
        dom: SettingsSectionElement,
    }).getSection(sectionNameDeleteData)

    const deleteDataGroup = sectionDeleteData.createGroup({
        id: groupNameDeleteData,
        options: {},
        dom: SettingsGroupContainer,
    }).getGroup(groupNameDeleteData)

    deleteDataGroup.createItem({
        id: "privacy-delete-data-button",
        options: {},
        async dom() {
            const accounts = Auth.authed;

            const accountsCards = accounts.map((el) => {
                const accountCard = new WarningConstructorButton({
                    type: 0,
                    button: {
                        content: el instanceof MonoCorpAPI ? $$("settings/privacy/delete_data/delete_account") : $$("settings/privacy/delete_data/control_access"),
                        handler: async () => {
                            if (!(el instanceof MonoCorpAPI)) {
                                window.open("https://api.monobank.ua", "_blank");
                                return;
                            }

                            const p = Prompt({
                                title: $$("settings/privacy/delete_data/nuke_confirm"),
                                text: $$("settings/privacy/delete_data/nuke_confirm_description"),
                                buttons: [
                                    {
                                        content: $$("close"),
                                        handler() {
                                            p.close()
                                        },
                                        type: "light",
                                    },
                                    {
                                        content: $$("continue"),
                                        async handler() {
                                            p.close();
                                            const l = loadingPopup();
                                            try {
                                                const res = await el.nuke();
                                                if (res.status !== true) {
                                                    throw new Error(res.error || String(res));
                                                }
                                                await Auth.destroyInstance(el.id);
                                                new SlideOut({
                                                    duration: 100,
                                                    timingFunc: EaseOutCubic,
                                                }).apply(accountCard)
                                                l.close();
                                                Toast.add($$("settings/privacy/delete_data/nuke_success"), 3000);
                                            } catch (e) {
                                                l.close();
                                                const p = Prompt({
                                                    title: $$("settings/privacy/delete_data/nuke_error"),
                                                    text: String(e),
                                                    buttons: [
                                                        {
                                                            content: $$("close"),
                                                            handler() {
                                                                p.close()
                                                            },
                                                        },
                                                    ],
                                                })
                                            }
                                        },
                                    },
                                ],
                            })
                        },
                    },
                    title: el.name,
                    content: (el instanceof MonoCorpAPI ? $$("settings/privacy/delete_data/corp_account") + ` (${new URL(el.domain).hostname})` : $$("settings/privacy/delete_data/personal_account"))
                        + ". Mono ID: " + el.clientId,
                    style: {
                        border: 0,
                        borderRadius: 0,
                    }
                });

                return accountCard;
            })

            if (accounts.length === 0) {
                return new WarningConstructor({
                    title: $$("settings/privacy/delete_data/empty"),
                    content: $$("settings/privacy/delete_data/empty_info"),
                    icon: "people",
                    type: 1,
                })
            }

            return new CardList(accountsCards.map((c) => ({ content: c })))
        },
    })
}

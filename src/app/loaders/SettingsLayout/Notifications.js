import DOM from "@DOMPath/DOM/Classes/dom"
import { $$, $ } from "@Core/Services/Language/handler"
import IconSide from "@Environment/Library/DOM/object/iconSide"
import { SettingsSectionElement, SettingsGroupContainer } from "@Environment/Library/DOM/settings"
import { CardList, CardContent } from "@Environment/Library/DOM/object/card"
import Push from "@Core/Services/Push"
import { SwitchLabel, SelectInput } from "@Environment/Library/DOM/object/input"
import WarningConstructor from "@Environment/Library/DOM/object/warnings/WarningConstructor"
import loadingPopup from "@App/library/loadingPopup"
import NotificationManager from "@Core/Services/Push/NotificationManager"
import Navigation from "@Core/Services/navigation"
import delayAction from "@Core/Tools/objects/delayAction"
import Auth from "@App/modules/mono/services/Auth"


export default function generateNotificationsSettingsLayout(act) {
    const sectionName = "notifications-explain"
    const groupName = "notifications-explain-group"

    const sectionNameList = "notifications-list"
    const groupNameList = "notifications-list-group"

    const infoSection = act.createSection({
        id: sectionName,
        options: {},
        dom: SettingsSectionElement,
    }).getSection(sectionName)

    infoSection
        .createGroup({
            id: groupName,
            options: {},
            dom: SettingsGroupContainer,
        })
        .getGroup(groupName)
        .createItem({
            id: "notifications-explain-text",
            options: [$("@settings/notifications/info")],
            dom: CardContent,
        })

    const sectionList = act.createSection({
        id: sectionNameList,
        options: {
            name: $$("@settings/notifications/list"),
        },
        dom: SettingsSectionElement,
    }).getSection(sectionNameList)

    sectionList
        .createGroup({
            id: groupNameList,
            options: {},
            dom: SettingsGroupContainer,
        })
        .getGroup(groupNameList)
        .createItem({
            id: "notifications-list-element",
            options: {},
            async dom() {
                const l = loadingPopup()
                let sources
                try {
                    sources = (await Push.listSources())
                } catch (e) {
                    sources = []
                }
                sources = sources.map((el) => new SwitchLabel(
                    [el.on, (st, o, toggle) => Push.configure(el.channel, st, el),
                        { approveFirst: true }],
                    new IconSide(el.icon || "notifications",
                        [
                            new DOM({ new: "div", content: el.sign }),
                            new DOM({ new: "div", content: el.description, style: { opacity: 0.6, fontSize: "0.8em" } }),
                        ],
                        {
                            style: {
                                margin: "5px 15px 5px 5px",
                                fontSize: "32px",
                            },
                        }),
                ))

                if (sources.length === 0) {
                    l.close()
                    return new WarningConstructor({
                        title: $$("@settings/notifications/empty"),
                        content: $$("@settings/notifications/empty_info"),
                        icon: "notification_important",
                        type: 1,
                    })
                }

                l.close()

                return new CardList(sources.map((c) => ({ content: c })))
            },
        })

    const sectionPushURL = act.createSection({
        id: "notifications-push-url-section",
        options: {
            name: $$("@settings/notifications/push_service"),
        },
        dom: SettingsSectionElement,
    }).getSection("notifications-push-url-section")

    sectionPushURL
        .createGroup({
            id: "notifications-push-url",
            options: {},
            dom: SettingsGroupContainer,
        })
        .getGroup("notifications-push-url")
        .createItem({
            id: "notifications-push-url-input",
            options: {},
            async dom() {
                await Auth.onInit
                await Auth.waitListReady
                await new Promise((resolve) => delayAction(resolve))
                const services = Array.from(NotificationManager.services.values())
                    .map((service) => ({ content: service.name, value: service }))

                const current = services.findIndex((e) => e.value === NotificationManager.service)

                return new CardContent(
                    new SelectInput(
                        {
                            placeholder: $$("@settings/notifications/push_service_url"),
                            options: services,
                            defaultOption: current,
                            emptySelection: false,
                            async change(option) {
                                const { value } = option
                                NotificationManager.active = value.id
                                NotificationManager.subscription = null
                                await NotificationManager.activateActiveService()
                                delayAction(() => { Navigation.url = { module: "settings", params: ["notifications"] } })
                            },
                        },
                    ),
                    { paddingTop: 0 },
                )
            },
        })
}

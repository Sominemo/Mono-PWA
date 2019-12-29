import fileSizeForHuman from "@Core/Tools/transformation/text/fileSizeForHuman"
import DOM from "@DOMPath/DOM/Classes/dom"
import { $$, $ } from "@Core/Services/Language/handler"
import IconSide from "@Environment/Library/DOM/object/iconSide"
import { SettingsSectionElement, SettingsGroupContainer } from "@Environment/Library/DOM/settings"
import { CardList } from "@Environment/Library/DOM/object/card"
import { Button } from "@Environment/Library/DOM/object/input"
import DBUserPresence from "@Core/Services/DBUserPresence"

export default function generateDBSettingsLayout(act) {
    const list = DBUserPresence.getAll()

    list.forEach((e) => {
        const sectionName = `db-user-presence-section-${e.id}`
        const groupName = `db-user-presence-group-${e.id}`
        const descriptionName = `db-user-presence-description-${e.id}`

        let sizeContainer

        async function calculateSize() {
            const byteSize = await e.size()
            let byteQuota
            if ("quota" in e) byteQuota = await e.quota()
            const size = fileSizeForHuman(byteSize)
            let quota
            if ("quota" in e) quota = fileSizeForHuman(byteQuota)
            sizeContainer.clear(new DOM({
                new: "div",
                content: [
                    `${$$("@settings/storage/used")} ${size}${("quota" in e ? ` ${$("@settings/storage/of")} ${quota}` : "")}`,
                    ...(byteSize > byteQuota
                        ? [
                            new IconSide(
                                "warning",
                                (e.functions.find((er) => er.name === "auto-clean") ? $$("@settings/storage/cleanup_planned") : $$("@settings/storage/over_quota")),
                            ),
                        ]
                        : []),
                ],
            }))
        }

        async function updateStatus() {
            calculateSize()
        }

        sizeContainer = new DOM({ new: "div", content: `${$$("@settings/storage/calculating")}...`, onRender: updateStatus })

        act.createSection({
            id: sectionName,
            options: {
                name: new IconSide(e.icon, e.name, { normalIcon: true }),
            },
            dom: SettingsSectionElement,
        })
            .getSection(sectionName)
            .createGroup({
                id: groupName,
                options: {},
                dom: SettingsGroupContainer,
            })
            .getGroup(groupName)
            .createItem({
                id: descriptionName,
                dom: CardList,
                options: [
                    { content: e.description },
                    {
                        content: sizeContainer,
                    },
                    {
                        content: new DOM({
                            new: "div",
                            content: e.actions.map((action) => new Button({
                                content: action.name,
                                async handler(...a) {
                                    await action.handler(...a)
                                    updateStatus()
                                },
                            })),
                        }),
                    },
                ],
            })
    })
}

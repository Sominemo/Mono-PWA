import DOM from "@DOMPath/DOM/Classes/dom"
import { $$ } from "@Core/Services/Language/handler"
import IconSide from "@Environment/Library/DOM/object/iconSide"
import { SettingsSectionElement, SettingsGroupContainer } from "@Environment/Library/DOM/settings"
import { CardList } from "@Environment/Library/DOM/object/card"
import TransformatorsRegistry from "@Core/Services/Transformators/TransformatorsRegistry"


export default function generateTFSettingsLayout(act) {
    let list = TransformatorsRegistry.getAllInstnces()

    let sectionName = "tf-user-presence-section"
    let section

    if (list.length > 0) {
        section = act.createSection({
            id: sectionName,
            options: {
                name: $$("settings/tf/tf_instances"),
            },
            dom: SettingsSectionElement,
        }).getSection(sectionName)
    }

    list.forEach((el, i) => {
        const e = el.constructor
        e.id = i
        const groupName = `tf-user-presence-group-${e.id}`
        const descriptionName = `tf-user-presence-description-${e.id}`

        let lockContainer

        function gen() {
            return new DOM({
                new: "div",
                content: [
                    new IconSide((el.unlocked ? "lock_open" : "enhanced_encryption"), (el.unlocked ? $$("settings/tf/unlocked") : $$("settings/tf/locked"))),
                ],
            })
        }

        function isLocked() {
            lockContainer.clear(gen())
        }

        function updateStatus() {
            return isLocked()
        }

        lockContainer = new DOM({ new: "div", content: gen(), onRender: updateStatus })

        const description = (typeof el.tfRegistryDescription === "function"
            ? String(el.tfRegistryDescription())
            : (el.tfRegistryDescription === null ? "" : String(el.tfRegistryDescription))).trim()

        section
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
                    {
                        content: [
                            new IconSide(e.icon, e.name,
                                {
                                    normalIcon: true,
                                    containerStyle: {
                                        ...(description.length > 0 ? { marginBottom: "10px" } : {}),
                                        fontWeight: 500,
                                        fontSize: "1.25em",
                                    },
                                    style: { marginRight: "10px" },
                                }),
                            description,
                        ],
                    },
                    {
                        content: lockContainer,
                    },
                ],
            })
    })

    list = TransformatorsRegistry.getAll()

    sectionName = "tf-methods-user-presence-section"

    if (list.length > 0) {
        section = act.createSection({
            id: sectionName,
            options: {
                name: $$("settings/tf/tf_methods"),
            },
            dom: SettingsSectionElement,
        }).getSection(sectionName)
    }

    list.forEach((el) => {
        const e = el
        const groupName = `tf-method-user-presence-group-${e.id}`
        const descriptionName = `tf-method-user-presence-description-${e.id}`

        section
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
                    {
                        content: [
                            new IconSide(e.icon, e.name,
                                {
                                    normalIcon: true,
                                    containerStyle: {
                                        marginBottom: "10px",
                                        fontWeight: 500,
                                        fontSize: "1.25em",
                                    },
                                    style: { marginRight: "10px" },
                                }),
                            (typeof e.description === "function" ? e.description() : e.description),
                        ],
                    },
                ],
            })
    })
}

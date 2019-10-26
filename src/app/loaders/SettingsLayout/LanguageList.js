import LanguageCore from "@Core/Services/Language/core"
import DOM from "@DOMPath/DOM/Classes/dom"
import SettingsStorage from "@Core/Services/Settings/SettingsStorage"
import reloadToast from "@App/tools/interaction/reloadToast"
import { SettingsSectionElement, SettingsGroupContainer } from "@Environment/Library/DOM/settings"
import { RadioLabel } from "@Environment/Library/DOM/object/input"
import Design from "@Core/Services/design"

export default function generateLanguageList(act) {
    const langs = LanguageCore.languageList
    const current = LanguageCore.language.info.code

    const list = langs.map(lang => ({
        content: new DOM({
            new: "div",
            content: [
                new DOM({ new: "div", content: lang.name }),
                new DOM({ new: "div", content: lang.author, style: { color: Design.getVar("color-generic-light-b"), fontSize: "12px" } }),
            ],
        }),
        handler(s) {
            if (!s) return
            SettingsStorage.set("user_ui_language", lang.code)
            reloadToast()
        },
        selected: (lang.code === current),
    }))

    act.createSection({ id: "language-selection-section", dom: SettingsSectionElement, options: {} })
        .getSection("language-selection-section")
        .createGroup({ id: "language-selection-group", dom: SettingsGroupContainer, options: {} })
        .getGroup("language-selection-group")
        .createItem({ id: "language-selection-chooser-radios", dom: ({ items }) => new DOM({ new: "div", content: new RadioLabel(items, [], true) }), options: { items: list } })
}

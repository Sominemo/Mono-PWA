import Toast from "@Environment/Library/DOM/elements/toast"
import Prompt from "@Environment/Library/DOM/elements/prompt"
import { CoreLoader, CoreLoaderSkip, CoreLoaderResult } from "@Core/Init/CoreLoader"
import DOM from "@DOMPath/DOM/Classes/dom"
import SettingsStorage from "@Core/Services/Settings/SettingsStorage"

CoreLoader.registerTask({
    id: "wg-prompt",
    presence: "WG Prompt",
    async task() {
        const seen = await SettingsStorage.getFlag("wg_warning_seen")
        const firstSeen = await SettingsStorage.getFlag("wg_popup_first_seen")
        if (seen === true && firstSeen) return new CoreLoaderSkip()

        function popupOpen() {
            SettingsStorage.setFlag("wg_popup_first_seen", true)
            const w = Prompt({
                title: "Mono PWA Working Group",
                centredTitle: true,
                text: new DOM({
                    new: "div",
                    content: [
                        "Использование этой сборки предполагает участие в чате Telegram и сообщение о найденых ошибках",
                    ].map((e) => new DOM({ new: "p", content: e, style: { margin: "10px" } })),
                }),
                buttons: [
                    {
                        content: "Telegram",
                        handler() {
                            window.open("tg://join?invite=BEBMsBLX6NclKYzGkNlGNw", "_blank")
                            SettingsStorage.setFlag("wg_warning_seen", true)
                            w.close()
                        },
                        type: ["light"],
                    },
                    {
                        content: "Ясно",
                        handler: "close",
                    },
                ],
            })
        }

        if (firstSeen) {
            Toast.add("Добро пожаловать в программу тестирования Mono PWA", -1, {
                buttons: [
                    {
                        content: "Инфо",
                        handler: popupOpen,
                    },
                ],
            })
        } else {
            popupOpen()
        }
        return new CoreLoaderResult()
    },
})

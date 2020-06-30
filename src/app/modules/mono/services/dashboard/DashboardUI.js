import Navigation from "@Core/Services/navigation"
import { CoreLoader, CoreLoaderSkip, CoreLoaderResult } from "@Core/Init/CoreLoader"
import SettingsStorage from "@Core/Services/Settings/SettingsStorage"
import { $$ } from "@Core/Services/Language/handler"
import WindowManager from "@Core/Services/SimpleWindowManager"
import ModernBlocks from "@Environment/Library/DOM/buildBlock/modernBlocks"
import { Icon } from "@Environment/Library/DOM/object"
import DOM from "@DOMPath/DOM/Classes/dom"
import Design from "@Core/Services/design"
import ObjectWidget from "./cards/ObjectWidjet"
import HelpCard from "./cards/HelpCard"
import DashboardEditor from "./DashboardEditor"
import DashboardCore from "./DashboardCore"
import MonoModernBlocks from "./MonoModernBlocks"

export default class DashboardUI {
    static async Init() {
        if (Navigation.parse.params[0] === "settings") { this.InitSettings(); return }
        Navigation.updateTitle($$("dashboard"))
        const w = new MonoModernBlocks({
            centering: false,
            widgets: await DashboardCore.getLayout(),
            headerContent: [
                new DOM({
                    new: "div",
                    class: ["header-corner-button"],
                    content: [
                        new Icon("settings"),
                    ],
                    events: [
                        {
                            event: "click",
                            handler() {
                                Navigation.url = { module: "settings" }
                            },
                        },
                    ],
                }),
            ],
        })
        WindowManager.newWindow().append(w)
    }

    static InitSettings() {
        Navigation.updateTitle($$("settings"))
        const w = new ModernBlocks({
            fixedHeight: false,
            widgets: [
                {
                    item: new ObjectWidget(
                        [
                            {
                                type: "title",
                                content: $$("dashboard/settings"),
                            },
                            {
                                type: "icon",
                                color: Design.getVar("color-2", true),
                                icon: "dashboard",
                                content: $$("dashboard/settings/template/choose"),
                                clickable: true,
                                events: [
                                    {
                                        event: "click",
                                        handler() { DashboardUI.chooseTemplate() },
                                    },
                                ],
                            },
                            {
                                type: "icon",
                                color: Design.getVar("color-0", true),
                                icon: "delete",
                                content: $$("dashboard/settings/reset"),
                                clickable: true,
                                events: [
                                    {
                                        event: "click",
                                        handler() { DashboardUI.reset() },
                                    },
                                ],
                            },
                        ],
                    ),
                    x: 1,
                    y: 1,
                },
                {
                    item: new HelpCard([
                        {
                            name: "test_article",
                            link: "test-article-link",
                        },
                        {
                            name: "test_article_2",
                            link: "test-article-link-2",
                        },
                    ]),
                    x: 4,
                    actualX: "next",
                    y: 1,
                },
            ],
            append: [
                new DashboardEditor(),
            ],
        })
        WindowManager.newWindow().append(w)
    }
}

CoreLoader.registerTask({
    id: "dashboard_module",
    presence: "Dashboard",
    async task() {
        if (!(await SettingsStorage.getFlag("next_features"))) return new CoreLoaderSkip()
        Navigation.addModule({
            name: "Dashboard",
            id: "dashboard",
            callback() { DashboardUI.Init() },
        })

        Navigation.InitNavigationError = () => {
            Navigation.url = { module: "dashboard" }
        }

        Navigation.defaultScreen = () => {
            Navigation.url = { module: "dashboard" }
        }

        Navigation.titleFallback = "monobank"

        return new CoreLoaderResult()
    },
})

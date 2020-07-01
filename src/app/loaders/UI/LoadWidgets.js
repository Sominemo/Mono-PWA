import DashboardCore from "@App/modules/mono/services/dashboard/DashboardCore"
import NavWidget from "@App/modules/mono/services/dashboard/widgets/user/NavWidget"
import TextWidget from "@App/modules/mono/services/dashboard/widgets/internal/TextWidget"
import DefaultTemplate from "@App/modules/mono/services/dashboard/templates/default"
import LiteralActions from "@App/modules/mono/services/dashboard/cards/funcs/LiteralActions"
import Navigation from "@Core/Services/navigation"
import ClientsWidget from "@App/modules/mono/services/dashboard/widgets/user/ClientsWidget"
import HintsWidget from "@App/modules/mono/services/dashboard/widgets/user/HintsWidget"

DashboardCore.registerWidget({
    id: "Nav",
    builder: NavWidget,
    user: true,
})

DashboardCore.registerWidget({
    id: "ClientsCount",
    builder: ClientsWidget,
    user: true,
})

DashboardCore.registerWidget({
    id: "Text",
    builder: TextWidget,
    user: false,
})

DashboardCore.registerWidget({
    id: "Hints",
    builder: HintsWidget,
    user: true,
})

DashboardCore.defaultLayout = DefaultTemplate

LiteralActions.add("first_hello_replace", async () => {
    const l = await DashboardCore.getSettings()
    const i = l.findIndex((e) => e.tag === "service-greetings")
    if (i === -1) return
    const { x, y } = l[i]
    delete l[i]
    l.unshift({
        x,
        y,
        item: "Text",
        data: {
            params: {
                size: {
                    x: 2,
                    y: 1,
                },
            },
            content: [
                {
                    type: "title",
                    content: "Nice Job!",
                },
                {
                    type: "icon",
                    icon: "done_all",
                    color: { "": "var", value: "color-6" },
                    content: "Everything works",
                    subcontent: "Widget replace test is successful",
                },
            ],
        },
    })

    await DashboardCore.setSettings(l)
    Navigation.reload()
})

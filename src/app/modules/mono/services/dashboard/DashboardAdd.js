import DynamicListPopup from "@Environment/Library/DOM/object/input/dynamicListPopup"
import { $$ } from "@Core/Services/Language/handler"
import DashboardCore from "./DashboardCore"

export default function DashboardAdd(...params) {
    return new Promise((resolve, reject) => {
        DynamicListPopup({
            icon: "dashboard",
            placeholder: $$("dashboard/setup/find_widgets"),
            list(q) {
                return Array.from(Object.entries(DashboardCore.register))
                    .filter((e) => e[1].user
                        && e[1].builder.name.toUpperCase().includes(q.toUpperCase()))
                    .map(([key, value]) => ({
                        icon: value.builder.icon,
                        name: value.builder.name,
                        value: { ...value, dashboardID: key },
                    }))
            },
            async onSelect(data) {
                const config = await (() => data.builder.setup(...params))()
                // eslint-disable-next-line new-cap
                const instance = new data.builder({ data: config })
                instance.dashboardID = data.dashboardID
                resolve({ builder: instance, data: config })
            },
        })
    })
}

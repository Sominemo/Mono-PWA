import SettingsStorage from "@Core/Services/Settings/SettingsStorage"

export default class DashboardCore {
    static async getSettings() {
        return (await SettingsStorage.get("dashboard_layout")) || this.defaultLayout()
    }

    static setSettings(s) {
        return SettingsStorage.set("dashboard_layout", s)
    }

    static setLayout(s) {
        return this.setSettings(s.map((e) => ({
            ...e, item: this.getID(e.item),
        })))
    }

    static async getLayout() {
        return (await this.getSettings()).map((e) => {
            // eslint-disable-next-line new-cap
            const item = new (DashboardCore.getWidget(e.item).builder)({ data: e.data })
            item.dashboardID = e.item
            return {
                ...e, item,
            }
        })
    }

    static defaultLayout() {
        return []
    }

    static register = {}

    static registerWidget({
        id, builder, user,
    }) {
        if (id in this.register) throw new Error(`This ID (${id}) is already taken`)
        if (typeof builder !== "function") throw new TypeError(`Incorrect builder: Expected function, ${typeof builder} given`)
        if (typeof user !== "boolean") throw new TypeError(`Incorrect user: Expected boolean, ${typeof user} given`)

        this.register[id] = { builder, user }
    }

    static getWidget(name) {
        if (!(name in this.register)) return new Error("Unknown widget")
        return this.register[name]
    }

    static getID(instance) {
        if (!(instance.dashboardID in this.register)) throw new Error("Unknown widget")
        return instance.dashboardID
    }
}

import { WindowContainer } from "@Environment/Library/DOM/buildBlock"
import WindowManager from "@Core/Services/SimpleWindowManager"
import Navigation from "@Core/Services/navigation"
import { $$ } from "@Core/Services/Language/handler"
import { CoreLoader } from "@Core/Init/CoreLoader"
import { Title, TwoSidesWrapper } from "@Environment/Library/DOM/object"
import { InDevelopmentCard } from "@Environment/Library/DOM/object/warnings"
import { Card } from "@Environment/Library/DOM/object/card"

export default class StatementUI {
    static async Init() {
        const w = new WindowContainer()
        WindowManager.newWindow().append(w)

        w.render(new Title($$("@statement")))
        w.render(new InDevelopmentCard())
    }

    static GenerateCard(data) {
        return new Card([
            new TwoSidesWrapper([

            ]),
        ])
    }
}

CoreLoader.registerTask({
    id: "statement_module",
    presence: "Statement",
    task() {
        Navigation.addModule({
            name: "Statement",
            id: "statement",
            callback() { StatementUI.Init() },
        })
    },
})

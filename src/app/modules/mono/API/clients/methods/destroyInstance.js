import Auth from "@App/modules/mono/services/Auth"
import Toast from "@Environment/Library/DOM/elements/toast"
import Navigation from "@Core/Services/navigation"
import { $$ } from "@Core/Services/Language/handler"

export default function destroyInstance() {
    Auth.destroyInstance(this.id)
    Toast.add($$("@auth/you_were_unlogined"), -1,
        {
            buttons: [
                {
                    content: $$("@auth/reload"),
                    handler() {
                        // eslint-disable-next-line no-self-assign
                        Navigation.url = Navigation.url
                    },
                },
            ],
        })
}

import Prompt from "@Environment/Library/DOM/elements/prompt"
import DOM from "@DOMPath/DOM/Classes/dom"
import { Icon } from "@Environment/Library/DOM/object"
import SetupError from "./SetupError"

export default class SetupFramework {
    constructor({ func, name }, checkFit) {
        return new Promise(async (resolve, reject) => {
            while (this.moreSteps) {
                let action
                try {
                    // eslint-disable-next-line no-await-in-loop
                    action = await func(this.data, this.state, checkFit)
                } catch (e) {
                    if (!(e instanceof SetupError)) reject(e)

                    if (this.ui) this.ui.close()
                    this.moreSteps = false
                    reject(e)
                    break
                }
                // {string comment, async next, DOM ui}

                this.moreSteps = !!action.ui
                if (action.ui) {
                    const newUI = Prompt({
                        pureText: true,
                        text: new DOM({
                            new: "div",
                            class: "setupframework-body",
                            content: [
                                new DOM({
                                    new: "div",
                                    class: "setupframework-header",
                                    events: [
                                        {
                                            event: "click",
                                            handler() {
                                                newUI.close()
                                            },
                                        },
                                    ],
                                    content: [
                                        new DOM({
                                            new: "div",
                                            class: "setupframework-header-button",
                                            content: new Icon("close"),
                                        }),
                                        new DOM({
                                            new: "div",
                                            class: "setupframework-header-text",
                                            content: [
                                                new DOM({
                                                    new: "div",
                                                    content: name,
                                                }),
                                                new DOM({
                                                    new: "div",
                                                    content: action.comment,
                                                }),
                                            ],
                                        }),
                                    ],
                                }),
                                new DOM({
                                    new: "div",
                                    class: "setupframework-ui",
                                    content: action.ui,
                                }),
                            ],
                        }),
                    })
                    if (this.ui) this.ui.close()
                    this.ui = newUI
                    // eslint-disable-next-line no-await-in-loop
                    await action.next()
                }
            }

            if (this.ui) this.ui.close()
            resolve(this.data)
        })
    }

    data = {}

    state = {}

    moreSteps = true

    ui = null
}

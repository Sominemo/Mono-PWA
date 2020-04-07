import Prompt from "@Environment/Library/DOM/elements/prompt"
import { $$ } from "@Core/Services/Language/handler"
import { CardContent } from "@Environment/Library/DOM/object/card"
import DateInput from "@Environment/Library/DOM/object/input/contentEditableWidgets/dateInput"
import dateShift from "@Core/Tools/time/dateShift"
import loadingPopup from "@App/library/loadingPopup"
import Toast from "@Environment/Library/DOM/elements/toast"
import DOM from "@DOMPath/DOM/Classes/dom"
import SettingsStorage from "@Core/Services/Settings/SettingsStorage"
import { sameDay } from "@App/tools/transform/relativeDates"
import StatementStorage from "../services/StatementStorage"

async function multiloadStatement(ranges, cards, callback = () => { }) {
    await cards.reduce(
        (p, card) => p.then(
            () => ranges
                .reduce(
                    (pn, range) => pn.then(
                        () => card.statement(range[0], range[1]).then(callback),
                    ),
                    Promise.resolve(),
                ),
        ),
        Promise.resolve(),
    )
}

function calculateRanges(from, to = new Date()) {
    const fromT = from.getTime()
    const toT = to.getTime()
    if (from.getTime() >= to.getTime()) return []

    const ranges = []
    let inT = fromT
    while (inT < toT) {
        const inlT = Math.min(inT + 31 * 86400000, toT)
        ranges.push([new Date(inT + 1), new Date(inlT)])
        inT = inlT
    }

    return ranges
}

function statementDownloaderUI() {
    let to = new Date()
    let from = dateShift(-92 * 86400000, to)
    const p = Prompt({
        title: $$("download_statement"),
        text: [
            new CardContent($$("download_statement/description")),
            new DateInput({
                iconName: "calendar_today",
                placeholder: $$("download_statement/from"),
                content: from,
                onchange(e) { from = e },
            }),
            new DateInput({
                iconName: "date_range",
                placeholder: $$("download_statement/to"),
                content: to,
                onchange(e) { to = e },
            }),
        ],
        buttons: [
            {
                content: $$("close"),
                handler: "close",
                type: "light",
            },
            {
                content: $$("download_statement/download"),
                async handler() {
                    if (from.getTime() >= to.getTime()) {
                        Toast.add($$("download_statement/incorrect_range"))
                        return
                    }
                    const offMode = await SettingsStorage.getFlag("offline_mode")
                    if (offMode) {
                        Toast.add($$("download_statement/disable_offline_mode"))
                        return
                    }
                    const l = loadingPopup()

                    if (!sameDay(new Date(), to)) {
                        to.setHours(23)
                        to.setMinutes(59)
                        to.setSeconds(59)
                    }

                    from.setHours(0)
                    from.setMinutes(0)
                    from.setSeconds(0)

                    const cards = await StatementStorage.getAccountList(true, true)
                    const ranges = calculateRanges(from, to)
                    const taskCount = cards.length * ranges.length
                    let doneTasks = 0
                    try {
                        const progressBar = new DOM({
                            new: "div",
                            style: {
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                width: 0,
                                height: "4px",
                                background: "var(--color-toast-text)",
                                transition: "width .5s",
                                willChange: "width",
                            },
                        })

                        const text = new DOM({
                            new: "div",
                            content: [
                                $$("download_statement/working"),
                                progressBar,
                            ],
                            style: {
                                padding: "15px",
                            },
                        })
                        const toast = await Toast.add(text, -1)
                        await multiloadStatement(ranges, cards, () => {
                            doneTasks++
                            progressBar.style({ width: `${(doneTasks / taskCount) * 100}%` })
                        })

                        toast.pop()
                        Toast.add($$("done"))
                        p.close()
                    } catch (e) {
                        Toast.add($$("error"))
                    }
                    l.close()
                },
            },
        ],
    })
}

export {
    statementDownloaderUI,
    calculateRanges,
    multiloadStatement,
}

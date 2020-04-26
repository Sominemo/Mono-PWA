import { ReportTags, ReportTag } from "@Core/Services/Report"

const tags = [

    new ReportTag(
        "APP",
        {
            badge: {
                sign: "  APP  ",
                bg: "#3F51B5",
                text: "#FFFFFF",
                print: true,
            },
            level: 1,
        },
    ),

    new ReportTag(
        "VERSION",
        {
            badge: {
                sign: "VERSION",
                bg: "#3F51B5",
                text: "#FFFFFF",
                print: true,
            },
            level: 1,
        },
    ),
    new ReportTag(
        "DEBUG",
        {
            badge: {
                sign: " DEBUG ",
                bg: "#3F51B5",
                text: "#FFFFFF",
                print: true,
            },
            level: 1,
        },
    ),
    new ReportTag(
        "dummy",
        {
            db: false,
        },
    ),
    new ReportTag(
        "info",
        {
            badge: {
                sign: "INFO",
                bg: "#3f51b5",
                text: "#FFFFFF",
                print: true,
            },
            level: 1,
        },
    ),
    new ReportTag(
        "warn",
        {
            badge: {
                sign: "WARN",
                bg: "#ff9800",
                text: "#FFFFFF",
                print: true,
            },
            level: 2,
        },
    ),

    new ReportTag(
        "error",
        {
            badge: {
                sign: "ERROR",
                bg: "#f44336",
                text: "#FFFFFF",
                print: true,
            },
            level: 3,
        },
    ),
    new ReportTag(
        "crossMessaging",
        {
            badge: {
                sign: "Cross Messaging",
                bg: "#1da1f2",
                text: "#FFFFFF",
                print: true,
            },
        },
    ),
    new ReportTag(
        "crossMessaging.command",
        {
            badge: {
                sign: "Command",
                bg: "#009688",
                text: "#FFFFFF",
                print: true,
            },
        },
    ),
    new ReportTag(
        "crossMessaging.command.error",
        {
            badge: {
                sign: "Error",
                print: true,
            },
            level: 3,
        },
    ),
    new ReportTag(
        "core",
        {
            badge: {
                sign: "Core",
                bg: "#ffc107",
                text: "#000000",
                print: true,
            },
        },
    ),
    new ReportTag(
        "core.done",
        {
            badge: {
                sign: "DONE",
                bg: "#4caf50",
                text: "#FFFFFF",
                print: true,
            },
        },
    ),
    new ReportTag(
        "core.skip",
        {
            badge: {
                sign: "SKIP",
                bg: "#2196f3",
                text: "#FFFFFF",
                print: true,
            },
        },
    ),
    new ReportTag(
        "core.warn",
        {
            badge: {
                sign: "WARN",
                bg: "#ff9800",
                text: "#FFFFFF",
                print: true,
            },
            level: 2,
        },
    ),
    new ReportTag(
        "core.stop",
        {
            badge: {
                sign: "STOP",
                bg: "#f44336",
                text: "#FFFFFF",
                print: true,
            },
            level: 3,
        },
    ),
    new ReportTag(
        "auth",
        {
            badge: {
                sign: "Auth",
                bg: "#9c27b0",
                text: "#FFFFFF",
                print: true,
            },
        },
    ),
    new ReportTag(
        "auth.settings",
        {
            badge: {
                sign: "Settings",
                print: true,
            },
        },
    ),
    new ReportTag(
        "auth.direct",
        {
            badge: {
                sign: "Direct",
                print: true,
            },
        },
    ),
    new ReportTag(
        "auth.direct.fail",
        {
            badge: {
                sign: "Fail",
                print: true,
            },
            level: 3,
        },
    ),
    new ReportTag(
        "statement",
        {
            badge: {
                sign: "Statement",
                bg: "#607d8b",
                text: "#FFFFFF",
                print: true,
            },
        },
    ),
    new ReportTag(
        "statement.renderError",
        {
            badge: {
                sign: "Render Failure",
                print: true,
            },
            level: 3,
        },
    ),
    new ReportTag(
        "statement.constructorFailure",
        {
            badge: {
                sign: "Item constructor Failure",
                print: true,
            },
            level: 3,
        },
    ),
    new ReportTag(
        "api",
        {
            badge: {
                sign: "API",
                bg: "#607d8b",
                text: "#FFFFFF",
                print: true,
            },
        },
    ),
    new ReportTag(
        "api.error",
        {
            badge: {
                sign: "Error",
                print: true,
            },
            level: 3,
        },
    ),
    new ReportTag(
        "core.error",
        {
            badge: {
                sign: "Error",
                print: true,
            },
            level: 3,
        },
    ),
    new ReportTag(
        "core.error.promise",
        {
            badge: {
                sign: "Promise",
                print: true,
            },
        },
    ),
    new ReportTag(
        "dom",
        {
            badge: {
                sign: "DOM",
                bg: "#009688",
                text: "#FFFFFF",
                print: true,
            },
        },
    ),
    new ReportTag(
        "dom.error",
        {
            badge: {
                sign: "OOPS",
                bg: "#f44336",
                text: "#FFFFFF",
                print: true,
            },
            level: 3,
        },
    ),
    new ReportTag(
        "dom.warn",
        {
            badge: {
                sign: "WARN",
                bg: "#ff9800",
                text: "#FFFFFF",
                print: true,
            },
            level: 2,
        },
    ),
    new ReportTag(
        "dom.log",
        {
            badge: {
                sign: "INFO",
                bg: "#2196f3",
                text: "#FFFFFF",
                print: true,
            },
            level: 3,
        },
    ),
    new ReportTag(
        "style",
        {
            badge: {
                sign: "Style",
                bg: "#8bc34a",
                text: "#FFFFFF",
                print: true,
            },
        },
    ),
    new ReportTag(
        "style.loadError",
        {
            badge: {
                sign: "Load Error",
                print: true,
            },
            level: 3,
        },
    ),
    new ReportTag(
        "style.changeError",
        {
            badge: {
                sign: "Theme Change Error",
                print: true,
            },
            level: 3,
        },
    ),
    new ReportTag(
        "nav",
        {
            badge: {
                sign: "NAV",
                bg: "#3f51b5",
                text: "#FFFFFF",
                print: true,
            },
        },
    ),
    new ReportTag(
        "nav.change",
        {
            badge: {
                sign: ":",
                bg: "#3f51b5",
                text: "#FFFFFF",
                print: true,
            },
        },
    ),
    new ReportTag(
        "nav.back",
        {
            badge: {
                sign: "‹",
                bg: "#3f51b5",
                text: "#FFFFFF",
                print: true,
            },
        },
    ),
    new ReportTag(
        "nav.forward",
        {
            badge: {
                sign: "›",
                bg: "#3f51b5",
                text: "#FFFFFF",
                print: true,
            },
        },
    ),
    new ReportTag(
        "sw",
        {
            badge: {
                sign: "SW",
                bg: "#607D8B",
                text: "#FFFFFF",
                print: true,
            },
        },
    ),
    new ReportTag(
        "sw.reloadReady",
        {
            badge: {
                sign: "Ready to reload",
                bg: "#4caf50",
                text: "#FFFFFF",
                print: true,
            },
        },
    ),
    new ReportTag(
        "sw.newUpdate",
        {
            badge: {
                sign: "New update found",
                bg: "#9c27b0",
                text: "#FFFFFF",
                print: true,
            },
        },
    ),
    new ReportTag(
        "sw.error",
        {
            badge: {
                sign: "Error",
                print: true,
            },
            level: 3,
        },
    ),
    new ReportTag(
        "lang",
        {
            badge: {
                sign: "Lang",
                bg: "#795548",
                text: "#FFFFFF",
                print: true,
            },
        },
    ),
    new ReportTag(
        "lang.stringError",
        {
            badge: {
                sign: "String Error",
                print: true,
            },
            level: 3,
        },
    ),
    new ReportTag(
        "push",
        {
            badge: {
                sign: "Lang",
                bg: "#009688",
                text: "#FFFFFF",
                print: true,
            },
        },
    ),
    new ReportTag(
        "push.subscription",
        {
            badge: {
                sign: "Subscription made",
                bg: "#4caf50",
                text: "#FFFFFF",
                print: true,
            },
        },
    ),
    new ReportTag(
        "settings",
        {
            badge: {
                sign: "Settings",
                bg: "#8bc34a",
                text: "#FFFFFF",
                print: true,
            },
        },
    ),
    new ReportTag(
        "settings.get",
        {
            badge: {
                sign: "GET",
                bg: "#8bc34a",
                text: "#FFFFFF",
                print: true,
            },
        },
    ),
    new ReportTag(
        "settings.set",
        {
            badge: {
                sign: "SET",
                bg: "#8bc34a",
                text: "#FFFFFF",
                print: true,
            },
        },
    ),
    new ReportTag(
        "settings.reset",
        {
            badge: {
                sign: "RESET",
                bg: "#8bc34a",
                text: "#FFFFFF",
                print: true,
            },
        },
    ),
    new ReportTag(
        "lang.get.failure",
        {
            badge: {
                sign: "Error",
                print: true,
            },
            level: 3,
        },
    ),
    new ReportTag(
        "lang.set.failure",
        {
            badge: {
                sign: "Error",
                print: true,
            },
            level: 3,
        },
    ),
    new ReportTag(
        "lang.reset.failure",
        {
            badge: {
                sign: "Error",
                print: true,
            },
            level: 3,
        },
    ),
    new ReportTag(
        "idb",
        {
            badge: {
                sign: "IDB",
                bg: "#ff9800",
                text: "#FFFFFF",
                print: true,
            },
        },
    ),
    new ReportTag(
        "idb.blocked",
        {
            badge: {
                sign: "Blocked",
                print: true,
            },
            level: 2,
        },
    ),
    new ReportTag(
        "idb.blocking",
        {
            badge: {
                sign: "Blocking",
                print: true,
            },
            level: 2,
        },
    ),
]

tags.forEach((e) => ReportTags.add(e))

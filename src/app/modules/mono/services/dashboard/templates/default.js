export default function defaultDashboardTemplate() {
    const template = [
        {
            x: 1,
            y: 1,
            tag: "service-greetings",
            item: "Text",
            data: {
                params: {
                    name: { "": "loc", value: "dashboard/service/welcome" },
                },
                content: [
                    {
                        type: "title",
                        content: { "": "loc", value: "dashboard/service/welcome" },
                    },
                    {
                        type: "icon",
                        icon: "dashboard",
                        color: { "": "var", value: "color-2" },
                        content: { "": "loc", value: "dashboard/service/promo_configure" },
                    },
                    {
                        type: "icon",
                        icon: "aspect_ratio",
                        color: { "": "var", value: "color-8" },
                        content: { "": "loc", value: "dashboard/service/promo_position" },
                    },
                    {
                        type: "icon",
                        icon: "menu",
                        color: { "": "var", value: "color-9" },
                        content: { "": "loc", value: "dashboard/service/promo_menu" },
                    },
                    {
                        type: "button",
                        content: {
                            right: [
                                {
                                    content: { "": "loc", value: "dashboard/service/got_it" },
                                    color: { "": "var", value: "color-9" },
                                    handler: { name: "first_hello_replace" },
                                },
                            ],
                        },
                    },
                ],
            },
        },
        {
            item: "Nav",
            data: { link: { module: "partners" } },
            y: 1,
            x: 4,
        },
        {
            item: "Nav",
            data: { link: { module: "settings" } },
            y: 2,
            x: 4,
        },
        {
            item: "ClientsCount",
            data: { type: "simple" },
            y: 3,
            x: 1,
        },
    ]
    return template
}

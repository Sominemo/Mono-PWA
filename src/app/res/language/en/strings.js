export default {
    statement: {
        "": "statement",
        load_more: "load more",
        no_operations_for_last_week: "you have not used this account in the last seven days",
        still_nothing: "still empty",
        warning: "warning",
        requests_throttling: `This account is linked using a personal token. 
        Due to the fact that monobank limits the frequency of access to the statement, the data will be loaded slowly. 
        It is recommended to connect the account using simplified auth.`,
        hint_customize: "Not what you were expecting?",
        hint_customize_text: "Control the order of cards and their appearance in the \"My cards\" menu",
        open: "open",
        choose_platinum_color: "choose the color of your platinum card",
        accounts_changed: "account list error",
        accounts_changed_text: "it looks like the list of accounts has been updated. Reload to apply changes",
        operation: "transaction",
    },
    customization: {
        open: "my cards",
        card: "card",
        bank: "bank",
        look: "card type",
        cardholder: "cardholder",
        currency: "currency",
        looks: {
            black: "black",
            grey: "gray",
            pink: "pink",
            white: "white",
            iron: "iron",
            yellow: "yellow",
        },
        warning: "Due to the limitations of the monobank API, the application cannot determine the type of your card. However, you can set it yourself",
    },
    currencies: {
        retry: "retry",
        fetch_fail: "error in receiving currencies",
        try_later: "try again later",
    },
    menu: {
        "": "menu",
        app_upgraded: "new update just dropped",
        see_whats_new: "see what's new",
    },
    auth: {
        "": "Auth",
        unofficial_warning: "Mono PWA is an unofficial application. It is not developed by monobank. Use the application only if you trust the developer and understand the risks (see Disclaimer)",
        you_were_unlogined: "you have been logged out",
        reload: "reload",
        login_params_changed: "the login parameters have been changed. Select \"Settings\", if you want to return them to their original state",
        login_promo: "log in to use all the features of Mono PWA",
        log_in: "log in",
        skip_step: "skip",
        unknown_auth_method: "unknown login method",
        success: "success",
        fail: "We could not confirm the data is correct",
        login_data_fetch_fail: "Login credentials failed",
        settings: {
            "": "customization",
            token: {
                "": "Use your own token",
                description: "The app will send requests to monobank directly. You can get a token on the api.monobank.ua portal",
                title: "Own token",

                token: "token",
            },
            domain: {
                "": "Change the corporate server",
                description: "If you do not trust the server to which requests are sent during simplified auth, you can change it",
                title: "Change server",

                unsupported_server: "incompatible server",
                url: "URL",

                proto_detected: "server detected",
                name: "title",
                author: "author",
                proto_ver: "protocol version",
                visit_homepage: "home page",
                server_message: "message from",
                see_link: "open the link",
            },
            revert: {
                "": "Continue as usual",
                description: "Discard advanced authorization settings and return to the defaults",
            },
        },
        stage: {
            link: "link",
            opening: "opening monobank...",
            copied: "The link has been copied to the clipboard, follow the steps below",
            auto_link: "You should be logged in automatically. If not, follow the steps below",
            open: "open",
            qr: "QR",
            cancel: "cancel",
            authed: "authorized",
            error: "an error occurred",
            timeout: "the request took too long",
            instructions: {
                scan: {
                    "": "Scan the QR code",
                    description: "Open monobank › More › QR-Code Scanner",
                },
                follow: {
                    "": "Follow the link",
                    description: "Open the link or copy the URL to the browser on your mobile device",
                },
                permissions: {
                    "": "Provide access",
                    description: "Confirm access to some data in the monobank app window",
                },
            },
        },
    },
    p4: {
        "": "buy now, pay later",
        partners: "partners",
        fetch_fail: "error in receiving the list of partners",
        try_later: "try again later",
        retry: "repeat",
        cached_title: "saved copy",
        cache_for: "data as of",
        online: "online ordering",
        delivery: "with delivery",
        delivery_exp: "this indicator means that when buying in parts, the partner provides an option to place an order online with delivery",
        online_exp: "this indicator means that when buying in parts, the partner provides an option to place an order online, but you need to visit the store",
        categories: "categories",
        category: "category",
        choose_category: "select a category",
        all: "all",
        no_data: "no data to show",
    },
    currency: {
        "": "exchange rates",
        one: "currency",
        numbers: "rate",
        buy: "buy",
        sell: "sell",
        refresh: "refresh",
        payment_systems: "payment systems rates",
        result: "result",
        amount: "amount",
        convert: "currency converter",
        refreshing: "updating...",
        refreshed: "updated",
        error_refresh: "update error",
        cached_title: "saved copy",
        cache_for: "exchange rate as of",
        fetch_fail: "error in obtaining the exchange rate",
        try_later: "try again later",
        rerty: "retry",
    },
    recovery_mode: {
        "": "Emergency mode",
        enter: "restart the app to enter the Emergency mode",
        now: "Emergency mode is active",
        back_to_normal: "Restart the app without a custom hash to quit it",
        idb_fail: {
            warning: "attention",
            description: "There were difficulties trying to use the browser's storage. Please note that the app cannot work in Firefox private mode",
        },
    },
    units: {
        min: {
            type: "func",
            name: "plural",
            data: ["minute", "minutes"],
        },
    },
    dateformats: {
        week: {
            "": "week",
            days: {
                "": "days of the week",
                7: "sunday",
                1: "monday",
                2: "tuesday",
                3: "wednesday",
                4: "thursday",
                5: "friday",
                6: "saturday",
            },
        },
        relative: {
            today: "today",
            yesterday: "yesterday",
            tomorrow: "tomorrow",
        },

        month: {
            "": "month",
            1: "January",
            2: "February",
            3: "March",
            4: "April",
            5: "May",
            6: "June",
            7: "July",
            8: "August",
            9: "September",
            10: "October",
            11: "November",
            12: "December",
            months: {
                "": "months",
                1: "January",
                2: "February",
                3: "March",
                4: "April",
                5: "May",
                6: "June",
                7: "July",
                8: "August",
                9: "September",
                10: "October",
                11: "November",
                12: "December",
            },
        },
        at: "at",
    },
    settings: {
        "": "settings",
        locked_item: "Hint: You can't make changes here",
        restart_to_apply: "restart to apply changes",
        errors: {
            no_page: "there is no such settings page",
            layout_failed: "It looks like we couldn't load Settings",
        },
        descriptions: {
            about_app: "Version, more info",
            storage: "Used space, reports, cache",
            language: "Ukrainian, Russian, English",
            notifications: "Transactions alerts, news",
            offline_mode: "Use saved data only",
            show_minor_part: "Display amounts in 00.00 format",
            hide_credit_limit: "Deduct credit limit from the main balance",
            experiments: "Work in progress functionality",
        },
        auth: {
            "": "Auth",
            log_in: "log in",
            not_logined_title: "you are not logged in to your account",
            not_logined_text: "sign in to use all features",
            personal_token: "personal token",
            monobank_account: "monobank account",
            add_account: "add an account",
        },
        notifications: {
            "": "notifications",
            info: "This list shows the available notification sources based on your settings",
            list: "available sources",
            source: "notification source",
            empty: "no suggestions",
            empty_info: "log in to your supported monobank account to subscribe to notifications",
            push_service_url: "Notification service",
            push_service: "API",
            no_push_services_hint_title: "Don't understand why it's empty?",
            no_push_services_hint_body: "Learn how notifications work",
            no_push_services_hint_link: "https://sominemo.com/mono/help/article/en/how-push-servers-work",
        },
        privacy: {
            "": "privacy",
            info: "Sending error reports and analytics",
            analytics: "analytics",
            reports: "reports",
            send_errors: {
                "": "provide error data",
                info: "Sending minimal information to fix the error. Contains the text of the error, the location where it occurred, the version of the application, the name and version of the browser/OS",
            },
            send_reports: {
                "": "automatically send reports",
                info: "Sending the application event log. It contains events and errors, usage statistics, application version, browser and OS name and version",
            },
            debug_log: {
                "": "keep a detailed report",
                info: "Collecting all possible information for defamation. Do not enable if you do not need it",
            },
        },
        actions: {
            open_about: "about",
            go_main: "to the main page",
            restart: "reload",
        },
        general: {
            "": "general",
            information: "information",
        },
        language: "language",
        storage: {
            "": "storage",
            used: "used",
            of: "of",
            calculating: "calculating",
            cleanup_planned: "clean up scheduled on next load",
            over_quota: "the storage has exceeded the limit, but does not support automatic cleaning",
            dbs: {
                logs: {
                    "": "reports",
                    description: "basic information about the state of the app for debugging",
                },
                offline_cache: {
                    "": "standalone data",
                    description: "saved information received from the Internet to work with it without a network connection",
                },
                accounts: {
                    "": "accounts",
                    description: "your authorized monobank profiles",
                },
                statement_cache: {
                    "": "statements",
                    description: "a saved copy of your account statements",
                },
                card_settings: {
                    "": "cards",
                    description: "customize cards, such as their order, color, etc.",
                },
            },
            actions: {
                clear: "delete",
                export: "export",
                import: "import",
                log_out: {
                    "": "log out",
                    you_will_log_out: "by continuing, you will be logged out of all accounts",
                },
            },
        },
        updates: {
            "": "update",
            ready: "an update is available",
            tell_more: "more",
            later: "later",
            restart_now: "apply now",
            new_update: "the new version is ready for installation",
        },

        tf: {
            "": "transformers",
            tf_instances: "instances",
            unlocked: "unlocked",
            locked: "locked",
            tf_methods: "methods",
        },
    },
    about: {
        "": "about",
        app: "about the app",
        version: "version",
        build_date: "dbuild date",
        branch: "branch",
        debug: "debug",
        build_flags: "assembly flags",
        disclaimer_title: "disclaimer",
        disclaimer: `Mono PWA is not an official app and is not affiliated with monobank in any way.
The application uses a publicly available API and does not share your dat with third-parties for them to store it.
If you do not want to disclose your personal data to allow the service to function, you must discard the simplified auth service.
You always have the right to use personal token auth so that the data is transferred
directly to monobank. You assume responsibility for any outgoing requests on behalf of this software made
by you knowingly.
The app collects some depersonalized data through the Google Analytics service. Your first name, last name, unique identifiers 
and other sensitive data is not be disclosed to anyone. All data transmitted is used by the developer exclusively 
for the purpose of audience analysis, thus improving the experience of the application. You can always reject data collection
in the Privacy menu or by enabling the Do Not Track flag in your browser settings. 
You always have the right to request the source code of the application at support@sominemo.com,
modify, publish, and execute the code in any form, and you will be responsible for the content.`,
    },
    experiments: {
        "": "experiments",
        miscellaneous: "miscellaneous",
        warning: "warning",
        harmful_actions: `these options are experimental and some of them may cause problems, disrupt the stability of the program, or prevent it from working at all.
        After applying changes, you should restart the application.`,
        reload_page: "reload",
        reset_flags: "reset",
        list: "list",
        no_exps_placeholder: "there is nothing to test now",
        about: {
            deny_analytics: {
                title: "Opt out of data collection",
                about: `Disable the Google Analytics service and stop collecting depersonalized data used to improve the user experience (for more information, see the menu "About" › "Disclaimer").
                This flag is enabled automatically if Do Not Track requests are enabled in the browser`,
            },
            miscellaneous_in_settings: {
                title: "Show the Experiments menu in the settings",
                about: "Adds this page to the settings menu",
            },
            enable_tab_navigation: {
                title: "Navigate with the TAB key",
                about: `Simulate navigation where pressing TAB is equivalent to
                moving to the next item and pressing Enter to a click on the item`,
            },
        },
    },
    download_statement: {
        "": "download the statement",
        download: "begin",
        working: "downloading",
        disable_offline_mode: "turn off offline mode",
        from: "from",
        to: "to",
        incorrect_range: "wrong range",
        description: "You may need to download the statement if you want to use the history of transactions for a certain period without access to the network. The statement of each available account will be saved.",
    },
    push: {
        i: {
            std: {
                sign: "Notifications",
                description: "Notifications source",
            },
            statement: {
                unknown_account: "Statement",
                description: "Transaction notifications",
            },
            news: {
                sign: "News",
                description: "Changelogs, important information",
            },
        },
        not_supported: "Permission required",
        not_supported_title: "Notifications access needed",
        not_supported_text: "To receive notifications on an iOS/iPadOS device, make sure you are on iOS 16.4/iPadOS 16.4 or later.\n\n Safari only allows notifications if the app is added to the home screen. To do that, press the Share button in the browser and select \"Add to Home Screen\".\n\n If you are not on iOS or on an older iOS version and see this message, notifications are not supported on your device or in current browser.",
    },
    fatal_error: {
        "": "An error occurred",
        explainer: "The app cannot load",
        actions: {
            "": "What you can do:",
            send: {
                title: "Send report",
                info: "For analysis and resolution",
                title_sent: "Report sent",
                info_sent: "Thank you for your help",
                info_auto: "Auto-sending is enabled",
            },
            more: {
                title: "Other options",
                info: "Reporting, cache, resetting settings",
            },
            replay: {
                title: "Replay error",
                info: "With a detailed report recording",
                info_enabled: "Detailed reporting is already enabled",
            },
            clear: {
                title: "Clear cache",
                info: "The application won't work without the network",
            },
            reset: {
                title: "Perform reset",
                info: "Accounts and settings will be lost",
            },
            help: {
                title: "Seek help",
                info: "Feedback in Telegram chat",
            },
            export: {
                title: "Export report",
                info: "A file will be generated",
            },
        },
    },
    unexpected_error: "oops!",
    select_option: "select from the list",
    tap_to_change: "tap to change",
    done: "done",
    select_file: "select file",
    success: "success",
    failure: "failure",
    dev_warn: "this feature is in development",
    preview_warn: "this feature is currently being tested and may not work correctly",
    close: "close",
    next: "next",
    accept: "accept",
    continue: "continue",
    search: "search",
    offline_mode: "offline mode",
    hide_credit_limit: "hide credit balance",
    quick_settings: "options",
    show_minor_part: "show cents",
    recommendation: "recommendation",
    tip: "tip",
    hint: "hint",
    reload: "reload",
    enable_accessibility: "enable accessibility mode",
    skip_nav: "skip navigation",
    copied: "copied",
}

const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const WebpackPwaManifest = require("webpack-pwa-manifest")
const workboxPlugin = require("workbox-webpack-plugin")
const BitBarWebpackProgressPlugin = require("bitbar-webpack-progress-plugin")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const TerserPlugin = require("terser-webpack-plugin")
const ResourceHintWebpackPlugin = require("resource-hints-webpack-plugin")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const webpack = require("webpack")
const fecha = require("fecha")
const fs = require("fs-extra")
const chokidar = require("chokidar")
const mccCodes = require("mcc/emojiMap")
const cc = require("currency-codes/data")
const PATHS = require(path.join(__dirname, "paths"))

// Set to true to use downloadable lanugages
const DOWNLOAD_LANG_PACKS = false

// Origins with access to postMessage commands
const trustedOrigins = [
    "https://wg.mono.sominemo.com",
    "https://mono.sominemo.com",
]

// Create dir for generated assets
if (!fs.existsSync(PATHS.generated)) {
    fs.mkdirSync(PATHS.generated)
}

// Generates list of available languages
const makeLangMap = require(path.join(__dirname, "scripts", "languageList"))
makeLangMap(PATHS.language, PATHS.generated)

// Generates list of available themes from environment and app and combines them
const makeThemesMap = require(path.join(__dirname, "scripts", "themesList"))
makeThemesMap(PATHS.themes, PATHS.generated)
PATHS.themes.map((el) => fs.copySync(el, PATHS.themesGenerated))

// Generates custom emoji map for MCC search
const mccEmoji = require(path.join(__dirname, "scripts", "mccEmoji"))
const mccEmojiMap = mccEmoji(mccCodes)

// Simplified country-codes dataset for service worker
const ccSW = require(path.join(__dirname, "scripts", "ccSW"))
const ccSWMap = ccSW(cc)

// Holder for manifest related stuff
const builder = {
    pack: require(path.join(PATHS.root, "package.json")),
}


// Webpack aliases for constant locations
const resolveAlias = {
    "@DOMPath": path.join(PATHS.core, "DOM"),
    "@Resources": PATHS.resources,
    "@EnvResources": PATHS.envResources,
    "@Generated": PATHS.generated,
    "@App": PATHS.app,
    "@Core": PATHS.core,
    "@Environment": PATHS.environment,
    "@Themes": PATHS.themesGenerated,
}

// Variable that will contain used build flags
const buildFlags = []

module.exports = (env = {}) => {
    // If true -- it's a production build
    const PROD = !!env.PRODUCTION

    // Var with passed changelog URL
    const CHANGELOG = env.CHANGELOG || null

    // Set path for output
    PATHS.build = (env.LOCAL ? PATHS.localBuild : (env.WG ? PATHS.wgBuild : PATHS.build))

    // If not null - GA will be enabled
    const ANALYTICS_TAG = (env.ANALYTICS ? (!env.WG ? "G-81RB2HPF8X" : "G-PEX3Q03WQ6") : null)

    // Output warning if it's a production build
    if (PROD) {
        console.log("-- PRODUCTION BUILD --")
        // Add `prod` build flag
        buildFlags.push("prod")
    } else {
        env.DEBUG = true
    }

    // Mark if in CI mode
    if (env.CI) {
        buildFlags.push("ci")
    }

    // Mark if pre-release build
    if (env.WG) buildFlags.push("wg")

    // Mark if debug is enabled
    if (env.DEBUG) buildFlags.push("debug")

    // Mark if this build is made for localhost deployment
    if (env.LOCAL) buildFlags.push("local")

    // Mark if GA is enabled
    if (env.ANALYTICS) buildFlags.push("analytics")

    // Build version changer
    builder.build = Number.parseInt(builder.pack.version.match(/^.+?(\+(\d+))?$/)[2]) + (env.CI ? 0 : 1)
    const clearVersion = builder.pack.version.match(/^(.+?)(\+\d+)?$/)[1]
    if (!env.CI) {
        builder.pack.version = `${clearVersion}+${builder.build}`
        if (builder.build !== null) fs.writeFile(path.join(PATHS.root, "package.json"), JSON.stringify(builder.pack, null, 4))
    }
    builder.pack.version = clearVersion

    // Copy updated theme files if in watch mode
    if (env.watch && !env.CI) {
        const cb = () => {
            try {
                PATHS.themes.map((el) => fs.copySync(el, PATHS.themesGenerated))
            } catch (e) {
                console.warn("File is busy")
            }
        }

        chokidar.watch(PATHS.themes)
            .on("add", cb)
            .on("change", cb)
            .on("unlink", cb)
    }

    // Feedback URL for error screen
    const feedbackLink = "tg://join?invite=BEBMsBLX6NclKYzGkNlGNw"

    // Contants that will be passes both to main flow and WebWorker
    const mainDefine = {
        __PACKAGE_APP_NAME: JSON.stringify(builder.pack.description),
        __PACKAGE_VERSION_NUMBER: JSON.stringify(builder.pack.version),
        __PACKAGE_BUILD: JSON.stringify(builder.build),
        __PACKAGE_BRANCH: JSON.stringify((env.WG ? "workgroup" : builder.pack.config.branch)),
        __PACKAGE_BUILD_TIME: webpack.DefinePlugin.runtimeValue(() => JSON.stringify(fecha.format(new Date(), "DD.MM.YYYY HH:mm:ss")), true),
        __PACKAGE_BUILD_FLAGS: JSON.stringify(buildFlags),
        __PACKAGE_CHANGELOG: JSON.stringify(CHANGELOG),
        __PACKAGE_ANALYTICS: JSON.stringify(ANALYTICS_TAG),
        __PACKAGE_DOWNLOADABLE_LANG_PACKS: JSON.stringify(!!DOWNLOAD_LANG_PACKS),
        __PACKAGE_FEEDBACK: JSON.stringify(feedbackLink),
        __MCC_CODES_EMOJI: JSON.stringify(mccEmojiMap),
        __TRUSTED_ORIGINS: JSON.stringify(trustedOrigins),
    }

    // Contsnts for main flow
    const definePlugin =
        new webpack.DefinePlugin(mainDefine)

    // Constants for WebWorker
    const definePluginSW =
        new webpack.DefinePlugin({
            ...mainDefine,
            __CC_SHRUNK_DATASET: JSON.stringify(ccSWMap),
        })

    // Main flow webpack config
    const appConfig = {
        watch: !!env.watch,
        performance: { hints: false },
        optimization: {
            namedChunks: true,
            runtimeChunk: false,
            splitChunks: {
                automaticNameDelimiter: '.',
                cacheGroups: {
                    // Uncomment to produce vendor.js chunk
                    /*vendor: {
                        test: /node_modules/,
                        chunks: "initial",
                        name: "vendor",
                        enforce: true,
                        reuseExistingChunk: true,
                    },*/
                    ...(DOWNLOAD_LANG_PACKS ? {
                        language: {
                            test: /language[\\/].+[\\/]/,
                            enforce: true,
                            reuseExistingChunk: true,
                            name(module, chunks) {
                                const packageName = module.context
                                    .match(/language[\\/](.*?)([\\/]|$)/)[1]
                                return `.assets/language/${packageName.replace("@", "")}`
                            },
                        },
                    } : {}),

                },
            },
            // Use minimizer in production
            ...(PROD ? {
                minimizer: [
                    new TerserPlugin({
                        parallel: true,
                        sourceMap: true,
                        cache: true,
                    }),
                ],
            } : {}),
        },
        resolve: {
            alias: resolveAlias
        },
        entry: {
            index: path.join(PATHS.core, "Init", "index.js"),
        },
        // Source maps are generated only in debug mode
        ...(env.DEBUG ? { devtool: "source-map" } : {}),
        output: {
            path: PATHS.build,
            chunkFilename: "[id].js",
            filename: "[name].js",
            publicPath: "/",
        },
        mode: (PROD ? "production" : "development"),
        module: {
            rules: [
                {
                    test: /\.js$/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: ["@babel/preset-env"],
                            babelrc: true,
                            compact: true,
                        },
                    },
                },
                {
                    test: /\.css$/,
                    exclude: /theme\.css$/,
                    use: [{ loader: "style-loader", options: { injectType: "styleTag" } }, { loader: "css-loader" }],
                },
                {
                    test: /theme\.css$/,
                    use: [{ loader: "style-loader", options: { injectType: "lazyStyleTag" } }, { loader: "css-loader" }],
                },
                {
                    test: /\.svg$/,
                    exclude: path.join(PATHS.resources, "images", "vector", "css"),
                    loader: "svg-inline-loader",
                },
                {
                    test: /\.(png|jpg|gif)$/,
                    loader: ["url-loader"],
                },
                {
                    test: /\.svg$/,
                    include: path.join(PATHS.resources, "images", "vector", "css"),
                    loader: ["url-loader"],
                },
                {
                    test: /\.(woff(2)?|ttf|eot|font\.svg)(\?v=[a-z0-9]\.[a-z0-9]\.[a-z0-9])?$/,
                    use: [{
                        loader: "file-loader",
                        options: {
                            name: "[name].[ext]",
                            outputPath: ".assets/fonts/",
                        },
                    }],
                },
            ],
        },
        plugins: [
            new BitBarWebpackProgressPlugin(),
            new CopyWebpackPlugin({
                patterns: [
                    { from: path.join(PATHS.resources, ".well-known"), to: path.join(PATHS.build, ".well-known") },
                    { from: path.join(PATHS.resources, "template.htaccess"), to: path.join(PATHS.build, ".htaccess"), toType: "file" },
                    { from: path.join(PATHS.resources, "robots.txt"), to: path.join(PATHS.build, "robots.txt"), toType: "file" },
                    { from: path.join(PATHS.envResources, "language.template.htaccess"), to: path.join(PATHS.build, ".assets", "language", ".htaccess"), toType: "file" },
                    { from: path.join(PATHS.resources, "images", "logo", "ios"), to: path.join(PATHS.build, ".assets", "icons", "ios") },
                    { from: path.join(PATHS.resources, "images", "shortcuts"), to: path.join(PATHS.build, ".assets", "shortcuts") },
                    { from: path.join(PATHS.resources, "animations"), to: path.join(PATHS.build, ".assets", "animations") },
                ],
            }),
            new HtmlWebpackPlugin({
                title: "monobank",
                favicon: path.join(PATHS.resources, "images", "logo", "favicon.ico"),
                template: path.join(PATHS.source, "index.ejs"),
                inject: "head",
                charset: "utf-8",
                meta: {
                    viewport: "width=device-width, initial-scale=1.0, maximum-scale=5.0",
                    description: "monobank Progressive Web Application",
                },
                prefetch: [
                    "https://fonts.googleapis.com/css?family=Roboto:400,500&subset=cyrillic",
                    "https://fonts.googleapis.com/css?family=IM+Fell+English:400,400italic|Product+Sans",
                ],
                gTag: ANALYTICS_TAG,
            }),
            new ResourceHintWebpackPlugin(),
            new WebpackPwaManifest({
                name: `monobank${env.WG ? " WG" : ""}`,
                short_name: `mono${env.WG ? " WG" : ""}`,
                scope: "/",
                description: "monobank Progressive Web Application",
                categories: ["banks", "finance", "money", "monobank", "finance management"],
                iarc_rating_id: "20f63c49-902f-44f5-bf08-50a6e18c5139",
                orientation: "any",
                related_applications: [
                    {
                        platform: "play",
                        url: "https://play.google.com/store/apps/details?id=app.monoweb",
                        id: "app.monoweb"
                    }
                ],
                background_color: "#FFFFFF",
                theme_color: "#FFFFFF",
                start_url: "/start/#/home",
                display: "standalone",
                screenshots: [
                    {
                        src: "https://sominemo.com/mono/assets/pictures/screenshots/1.png",
                        sizes: "596x1060",
                        type: "image/png",
                    },
                    {
                        src: "https://sominemo.com/mono/assets/pictures/screenshots/2.png",
                        sizes: "596x1060",
                        type: "image/png",
                    },
                    {
                        src: "https://sominemo.com/mono/assets/pictures/screenshots/3.png",
                        sizes: "596x1060",
                        type: "image/png",
                    },
                    {
                        src: "https://sominemo.com/mono/assets/pictures/screenshots/4.png",
                        sizes: "596x1060",
                        type: "image/png",
                    },
                    {
                        src: "https://sominemo.com/mono/assets/pictures/screenshots/5.png",
                        sizes: "596x1060",
                        type: "image/png",
                    },
                    {
                        src: "https://sominemo.com/mono/assets/pictures/screenshots/6.png",
                        sizes: "596x1060",
                        type: "image/png",
                    },
                ],
                shortcuts: [
                    {
                        name: "Виписка",
                        short_name: "Виписка",
                        description: "Відкрити список рахунків",
                        url: "/statement",
                        icons: [
                            {
                                src: "/.assets/shortcuts/statement.png",
                                type: "image/svg+xml",
                                sizes: "96x96",
                                purpose: "any",
                            },
                        ],
                    },
                    {
                        name: "Курси валют",
                        short_name: "Курси валют",
                        description: "Перевірити курси валют",
                        url: "/currency",
                        icons: [
                            {
                                src: "/.assets/shortcuts/currency.png",
                                type: "image/svg+xml",
                                sizes: "96x96",
                                purpose: "any",
                            },
                        ],
                    },
                    {
                        name: "Партнери",
                        short_name: "Партнери",
                        description: "Переглянути каталог партнерів",
                        url: "/partners",
                        icons: [
                            {
                                src: "/.assets/shortcuts/partners.png",
                                type: "image/svg+xml",
                                sizes: "96x96",
                                purpose: "any",
                            },
                        ],
                    },
                ],
                icons: [
                    {
                        src: path.join(PATHS.resources, "images", "logo", "512.png"),
                        sizes: [44, 50, 96, 100, 128, 150, 192, 256, 384, 512],
                        destination: path.join(".assets", "icons"),
                    },
                    {
                        src: path.join(PATHS.resources, "images", "logo", (env.WG ? "mask_wg.png" : (env.LOCAL ? "mask_local.png" : "mask.png"))),
                        size: '1024x1024',
                        purpose: 'maskable'
                    }
                ],
            }),
            new workboxPlugin.GenerateSW({
                swDest: "sw.js",
                importScripts: [
                    "sw-push.js"
                ],
                clientsClaim: true,
                skipWaiting: true,
                exclude: [/\.htaccess$/, /language\/.+$/],
                navigateFallback: "/index.html",
                navigateFallbackDenylist: [/^\/\.well-known/, /^\/\.assets/, /^\/favicon\.ico$/, /^\/sw\.js$/],
                directoryIndex: "index.html",
                offlineGoogleAnalytics: env.ANALYTICS,
                maximumFileSizeToCacheInBytes: 50 * 1024 * 1024,
                disableDevLogs: true,
                runtimeCaching: [
                    {
                        urlPattern: /language/,
                        handler: "StaleWhileRevalidate",
                    },
                    {
                        urlPattern: new RegExp("^https://api.monobank.ua/"),
                        handler: "NetworkOnly",
                    },
                    {
                        urlPattern: new RegExp("^https://fonts.gstatic.com/"),
                        handler: "StaleWhileRevalidate",
                    },
                    {
                        urlPattern: new RegExp("^https://fonts.googleapis.com/"),
                        handler: "StaleWhileRevalidate",
                    },
                    {
                        urlPattern: new RegExp("\\?imagecache$"),
                        handler: "StaleWhileRevalidate",
                    },
                ],
            }),
            definePlugin
        ],
    }

    const SWPushConfig = {
        target: "webworker",
        watch: !!env.watch,
        performance: { hints: false },

        ...(env.LOCAL ? {
            devServer: {
                contentBase: PATHS.localBuild,
                compress: true,
                port: 443,
                host: "0.0.0.0",
                historyApiFallback: {
                    index: "/",
                },
                public: "pc.my",
                hot: false,
                inline: false,
                liveReload: false,
                https: {
                    key: fs.readFileSync(path.join(__dirname, "scripts", "ssl", "server.key")),
                    cert: fs.readFileSync(path.join(__dirname, "scripts", "ssl", "server.crt")),
                },
            },
        } : {}),
        optimization: {
            namedChunks: true,
            runtimeChunk: false,
            splitChunks: {},
            ...(PROD ? {
                minimizer: [
                    new TerserPlugin({
                        parallel: true,
                        sourceMap: true,
                        cache: true,
                    }),
                ],
            } : {}),
        },
        resolve: {
            alias: resolveAlias
        },
        entry: {
            swscript: path.join(PATHS.app, "modules", "mono", "services", "Push", "SWScript.js"),
        },
        ...(!PROD || env.makeMaps ? { devtool: "source-map" } : {}),
        output: {
            path: PATHS.build,
            chunkFilename: "sw-push.[id].js",
            filename: "sw-push.js",
            publicPath: "/",
        },
        mode: (PROD ? "production" : "development"),

        module: {
            rules: [
                {
                    test: /\.js$/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: ["@babel/preset-env"],
                            babelrc: true,
                        },
                    },
                },
                {
                    test: /\.(png|jpg|gif|svg)$/,
                    loader: ["url-loader"],
                },
            ],
        },
        plugins: [
            new CleanWebpackPlugin({
                cleanStaleWebpackAssets: false,
            }),
            definePluginSW
        ]
    }

    return [SWPushConfig, appConfig]
}

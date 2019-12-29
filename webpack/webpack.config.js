const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const WebpackPwaManifest = require("webpack-pwa-manifest")
const workboxPlugin = require("workbox-webpack-plugin")
const BitBarWebpackProgressPlugin = require("bitbar-webpack-progress-plugin")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const WebpackAutoInject = require("webpack-auto-inject-version")
const TerserPlugin = require("terser-webpack-plugin")
const ResourceHintWebpackPlugin = require("resource-hints-webpack-plugin")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const webpack = require("webpack")
const fecha = require("fecha")
const fs = require("fs-extra")
const chokidar = require("chokidar")
const mccCodes = require("mcc/emojiMap")

const __root = process.cwd()

const PROD = process.env.NODE_ENV === "production"
const DOWNLOAD_LANG_PACKS = false

const PATHS = {
    root: __root,
    source: path.join(__root, "src"),
    build: path.join(__root, "build"),
    localBuild: path.join(__root, "local_build"),
    wgBuild: path.join(__root, "wg_build", "build"),
    generated: path.join(__root, "generated"),
    public: "https://mono.sominemo.com/",
}

PATHS.app = path.join(PATHS.source, "app")
PATHS.core = path.join(PATHS.source, "core")
PATHS.environment = path.join(PATHS.source, "environment")
PATHS.themesGenerated = path.join(PATHS.generated, "themes")

PATHS.resources = path.join(PATHS.app, "res")
PATHS.envResources = path.join(PATHS.environment, "res")
PATHS.language = path.join(PATHS.resources, "language")
PATHS.themes = [
    path.join(PATHS.resources, "styles", "themes"),
]

// Own scripts

if (!fs.existsSync(PATHS.generated)) {
    fs.mkdirSync(PATHS.generated)
}

const makeLangMap = require(path.join(__dirname, "scripts", "languageList"))
const makeThemesMap = require(path.join(__dirname, "scripts", "themesList"))
const mccEmoji = require(path.join(__dirname, "scripts", "mccEmoji"))
makeLangMap(PATHS.language, PATHS.generated)
makeThemesMap(PATHS.themes, PATHS.generated)
const mccEmojiMap = mccEmoji(mccCodes)
PATHS.themes.map((el) => fs.copySync(el, PATHS.themesGenerated))

const builder = {
    pack: require(path.join(__root, "package.json")),
}

module.exports = (env = {}) => {
    PATHS.build = (env.LOCAL ? PATHS.localBuild : (env.WG ? PATHS.wgBuild : PATHS.build))

    const ANALYTICS_TAG = (env.ANALYTICS ? (!env.WG ? "G-81RB2HPF8X" : "G-PEX3Q03WQ6") : null)

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

    return {
        watch: !!env.watch,
        performance: { hints: false },
        optimization: {
            namedChunks: true,
            runtimeChunk: false,
            splitChunks: {
                cacheGroups: {
                    vendor: {
                        test: /node_modules/,
                        chunks: "initial",
                        name: "vendor",
                        enforce: true,
                    },
                    ...(DOWNLOAD_LANG_PACKS ? {
                        language: {
                            test: /language[\\/].+[\\/]/,
                            enforce: true,
                            name(module, chunks) {
                                const packageName = module.context
                                    .match(/language[\\/](.*?)([\\/]|$)/)[1]
                                return `.assets/language/${packageName.replace("@", "")}`
                            },
                        },
                    } : {}),

                },
            },
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

        ...(env.LOCAL ? {
            devServer: {
                contentBase: PATHS.localBuild,
                compress: true,
                port: 8080,
                host: "0.0.0.0",
                historyApiFallback: {
                    index: "/",
                },
            },
        } : {}),
        resolve: {
            alias: {
                "@DOMPath": path.join(PATHS.core, "DOM"),
                "@Resources": PATHS.resources,
                "@EnvResources": PATHS.envResources,
                "@Generated": PATHS.generated,
                "@App": PATHS.app,
                "@Core": PATHS.core,
                "@Environment": PATHS.environment,
                "@Themes": PATHS.themesGenerated,
            },
        },
        entry: [
            path.join(PATHS.core, "Init", "index.js"),
        ],
        ...(!PROD || env.makeMaps ? { devtool: "source-map" } : {}),
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
            new CleanWebpackPlugin({
                cleanStaleWebpackAssets: false,
            }),
            new CopyWebpackPlugin([
                { from: path.join(PATHS.resources, ".well-known"), to: path.join(PATHS.build, ".well-known") },
                { from: path.join(PATHS.resources, "template.htaccess"), to: path.join(PATHS.build, ".htaccess"), toType: "file" },
                { from: path.join(PATHS.resources, "robots.txt"), to: path.join(PATHS.build, "robots.txt"), toType: "file" },
                { from: path.join(PATHS.envResources, "language.template.htaccess"), to: path.join(PATHS.build, ".assets", "language", ".htaccess"), toType: "file" },
                { from: path.join(PATHS.resources, "images", "logo", "ios"), to: path.join(PATHS.build, ".assets", "icons", "ios") },
                { from: path.join(PATHS.resources, "animations"), to: path.join(PATHS.build, ".assets", "animations") },
            ]),
            new WebpackAutoInject({
                SILENT: true,
                SHORT: "MONO",
                components: {
                    InjectAsComment: false,
                    InjectByTag: false,
                    AutoIncreaseVersion: true,
                },
                componentsOptions: {
                    AutoIncreaseVersion: {
                        runInWatchMode: false,
                    },
                },
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
                description: "monobank Progressive Web Application",
                background_color: "#181A1D",
                theme_color: "#181A1D",
                start_url: "/",
                display: "standalone",
                icons: [
                    {
                        src: path.join(PATHS.resources, "images", "logo", "512.png"),
                        sizes: [44, 50, 96, 100, 128, 150, 192, 256, 384, 512],
                        destination: path.join(".assets", "icons"),
                    },
                ],
            }),
            new workboxPlugin.GenerateSW({
                swDest: "sw.js",
                clientsClaim: true,
                skipWaiting: true,
                exclude: [/\.htaccess$/, /language\/.+$/],
                navigateFallback: "/",
                navigateFallbackBlacklist: [/^\/\.well-known/, /^\/\.assets/, /^\/favicon\.ico$/, /^\/sw\.js$/],
                directoryIndex: "index.html",
                offlineGoogleAnalytics: env.ANALYTICS,
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
                        handler: "CacheFirst",
                    },
                    {
                        urlPattern: new RegExp("^https://fonts.googleapis.com/"),
                        handler: "CacheFirst",
                    },
                    {
                        urlPattern: new RegExp("\\?imagecache$"),
                        handler: "CacheFirst",
                    },
                ],
            }),
            new webpack.DefinePlugin({
                __PACKAGE_APP_NAME: JSON.stringify(builder.pack.description),
                __PACKAGE_VERSION_NUMBER: JSON.stringify(builder.pack.version),
                __PACKAGE_BRANCH: JSON.stringify((env.WG ? "workgroup" : builder.pack.config.branch)),
                __PACKAGE_BUILD_TIME: webpack.DefinePlugin.runtimeValue(() => JSON.stringify(fecha.format(new Date(), "DD.MM.YYYY HH:mm:ss")), true),
                __PACKAGE_CHANGELOG: JSON.stringify([]),
                __PACKAGE_WG: JSON.stringify(!!env.WG),
                __PACKAGE_ANALYTICS: JSON.stringify(ANALYTICS_TAG),
                __PACKAGE_DOWNLOADABLE_LANG_PACKS: JSON.stringify(!!DOWNLOAD_LANG_PACKS),
                __MCC_CODES_EMOJI: JSON.stringify(mccEmojiMap),
            }),
        ],
    }
}

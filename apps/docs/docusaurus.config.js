// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github")
const darkCodeTheme = require("prism-react-renderer/themes/dracula")

/** @type {import('@docusaurus/types').Config} */
module.exports = {
    title: "Semaphore",
    tagline: "Documentation and Guides",
    url: "https://semaphore.pse.dev/",
    baseUrl: "/",
    favicon: "/img/favicon.ico",
    onBrokenLinks: "throw",
    onBrokenMarkdownLinks: "warn",
    organizationName: "semaphore-protocol",
    projectName: "semaphore",
    trailingSlash: false,

    plugins: ["docusaurus-plugin-sass"],

    i18n: {
        defaultLocale: "en",
        locales: ["en", "es"]
    },

    presets: [
        [
            "classic",
            /** @type {import('@docusaurus/preset-classic').Options} */
            ({
                docs: {
                    routeBasePath: "docs/",
                    sidebarPath: require.resolve("./sidebars.js"),
                    editUrl: "https://github.com/semaphore-protocol/website/edit/main/",
                    includeCurrentVersion: false
                },
                theme: {
                    customCss: [require.resolve("./src/css/custom.scss")]
                }
            })
        ]
    ],

    themeConfig:
        /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
        ({
            //announcementBar: {
            //id: "semaphore-v3",
            //content:
            //'<b>We are pleased to announce the release of <a target="_blank" rel="noopener noreferrer" href="https://github.com/semaphore-protocol/semaphore/releases/tag/v3.0.0">Semaphore V3</a> 🎉</b>',
            //backgroundColor: "#DAE0FF",
            //textColor: "#000000"
            //},
            navbar: {
                logo: {
                    alt: "Semaphore Logo",
                    src: "img/semaphore-logo.svg"
                },
                items: [
                    {
                        label: "Whitepaper",
                        to: "https://semaphore.pse.dev/whitepaper-v1.pdf",
                        position: "right",
                        className: "V1"
                    },
                    {
                        label: "Documentation",
                        href: "/docs/introduction",
                        position: "right",
                        className: "homepage"
                    },
                    {
                        label: "Github",
                        href: "https://github.com/semaphore-protocol",
                        position: "right"
                    },
                    {
                        type: "localeDropdown",
                        position: "right"
                    }
                ]
            },
            colorMode: {
                defaultMode: "dark",
                // Should we use the prefers-color-scheme media-query,
                // using user system preferences, instead of the hardcoded defaultMode
                respectPrefersColorScheme: true
            },
            prism: {
                theme: lightCodeTheme,
                darkTheme: darkCodeTheme,
                additionalLanguages: ["solidity"]
            },
            algolia: {
                appId: "6P229KVKCB",
                apiKey: "879bb5b002b6370f181f0f79f5c2afe2",
                indexName: "semaphoreliedzkp",
                contextualSearch: true
            }
        })
}

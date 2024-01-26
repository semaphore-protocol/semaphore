import type * as Preset from "@docusaurus/preset-classic"
import type { Config } from "@docusaurus/types"
import { themes } from "prism-react-renderer"

const lightCodeTheme = themes.oneLight
const darkCodeTheme = themes.oneDark

const config: Config = {
    title: "Semaphore",
    tagline: "Documentation and Guides",
    url: "https://docs.semaphore.pse.dev/",
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
            {
                docs: {
                    routeBasePath: "/",
                    sidebarPath: require.resolve("./sidebars.js"),
                    editUrl: "https://github.com/semaphore-protocol/website/edit/main/",
                    includeCurrentVersion: false
                },
                theme: {
                    customCss: [require.resolve("./src/css/custom.scss")]
                }
            } satisfies Preset.Options
        ]
    ],
    themeConfig: {
        announcementBar: {
            id: "semaphore-v4-alpha",
            content:
                '<b>Semaphore V4-alpha is out 🎉 <a href="/quick-setup">Try it out</a> and let us know for any feedback on <a href="https://semaphore.pse.dev/discord" target="_blank">Discord</a> or <a href="https://github.com/orgs/semaphore-protocol/discussions" target="_blank">Github</a>!</b>',
            backgroundColor: "#DAE0FF",
            textColor: "#000000"
        },
        navbar: {
            logo: {
                alt: "Semaphore Logo",
                src: "img/semaphore-logo.svg"
            },
            items: [
                {
                    type: "docsVersionDropdown",
                    position: "left",
                    dropdownActiveClassDisabled: true
                },
                {
                    label: "Whitepaper",
                    to: "https://docs.semaphore.pse.dev/whitepaper-v1.pdf",
                    position: "right",
                    className: "V1"
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
            additionalLanguages: ["solidity", "bash", "typescript"]
        },
        algolia: {
            appId: "6P229KVKCB",
            apiKey: "879bb5b002b6370f181f0f79f5c2afe2",
            indexName: "semaphoreliedzkp",
            contextualSearch: true
        }
    } satisfies Preset.ThemeConfig
}

export default config

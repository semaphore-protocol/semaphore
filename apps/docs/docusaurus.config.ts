import type * as Preset from "@docusaurus/preset-classic"
import type { Config } from "@docusaurus/types"
import { themes } from "prism-react-renderer"

const lightCodeTheme = themes.oneLight
const darkCodeTheme = themes.oneDark

const config: Config = {
    title: "Semaphore",
    tagline: "Semaphore documentation and guides.",
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
    headTags: [
        {
            tagName: "link",
            attributes: {
                rel: "preconnect",
                href: "https://psedev.matomo.cloud"
            }
        },
        {
            tagName: "script",
            innerHTML: `
                var _paq = window._paq = window._paq || [];
                /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
                _paq.push(['trackPageView']);
                _paq.push(['enableLinkTracking']);
                (function() {
                    var u="https://psedev.matomo.cloud/";
                    _paq.push(['setTrackerUrl', u+'matomo.php']);
                    _paq.push(['setSiteId', '10']);
                    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
                    g.async=true; g.src='//cdn.matomo.cloud/psedev.matomo.cloud/matomo.js'; s.parentNode.insertBefore(g,s);
                })();
            `,
            attributes: {}
        }
    ],
    presets: [
        [
            "classic",
            {
                docs: {
                    routeBasePath: "/",
                    sidebarPath: require.resolve("./sidebars.js"),
                    editUrl: "https://github.com/semaphore-protocol/semaphore/edit/main/apps/docs",
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
            id: "semaphore-v4-beta",
            content:
                '<b><a href="https://github.com/semaphore-protocol/semaphore/releases/tag/v4.0.0" target="_blank" rel="noopener noreferrer">Semaphore V4</a> is out 🎉 <a href="/getting-started">Try it out</a> and let us know if you have any feedback on <a href="https://semaphore.pse.dev/telegram" target="_blank" rel="noopener noreferrer">Telegram</a> or <a href="https://github.com/orgs/semaphore-protocol/discussions" target="_blank" rel="noopener noreferrer">Github</a>!</b>',
            backgroundColor: "#dde6fc",
            textColor: "#000000"
        },
        // Social media card
        image: "img/social-media.png",
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
                    to: "https://semaphore.pse.dev/whitepaper-v1.pdf",
                    position: "left",
                    className: "whitepaper-v1"
                },
                {
                    label: "Github",
                    href: "https://github.com/semaphore-protocol",
                    position: "right"
                },
                {
                    label: "Website",
                    href: "https://semaphore.pse.dev",
                    position: "right"
                },
                {
                    type: "localeDropdown",
                    position: "right"
                }
            ]
        },
        colorMode: {
            defaultMode: "light",
            // Should we use the prefers-color-scheme media-query,
            // using user system preferences, instead of the hardcoded defaultMode
            respectPrefersColorScheme: true
        },
        prism: {
            theme: lightCodeTheme,
            darkTheme: darkCodeTheme,
            additionalLanguages: ["solidity", "bash", "typescript", "dart"]
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

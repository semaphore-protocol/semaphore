import { extendTheme } from "@chakra-ui/react"
import colors from "./colors"
import components from "./components"
import styles, { font } from "./styles"

const config = {
    fonts: {
        heading: font.style.fontFamily,
        body: "DM Sans, sans-serif"
    },
    colors,
    styles,
    components,
    breakpoints: {
        base: "0px",
        sm: "320px",
        md: "768px",
        lg: "960px",
        xl: "1200px",
        "2xl": "1440px"
    }
}

export default extendTheme(config)

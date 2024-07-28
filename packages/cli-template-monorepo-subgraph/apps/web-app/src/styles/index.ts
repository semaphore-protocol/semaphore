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
    components
}

export default extendTheme(config)

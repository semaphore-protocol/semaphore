import { extendTheme } from "@chakra-ui/react"
import { Outfit } from "next/font/google"
import styles from "./styles"
import colors from "./colors"
import components from "./components"

const outfit = Outfit({ subsets: ["latin"] })

const config = {
    fonts: {
        heading: outfit.style.fontFamily,
        body: outfit.style.fontFamily
    },
    colors,
    styles,
    components
}

export default extendTheme(config)

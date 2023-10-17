import { extendTheme } from "@chakra-ui/react"
import { Inter } from "@next/font/google"
import styles from "./styles"
import colors from "./colors"
import components from "./components"

const inter = Inter({ subsets: ["latin"] })

const config = {
    fonts: {
        heading: inter.style.fontFamily,
        body: inter.style.fontFamily
    },
    colors,
    styles,
    components
}

export default extendTheme(config)

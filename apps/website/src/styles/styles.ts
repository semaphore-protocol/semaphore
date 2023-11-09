import { SystemStyleObject } from "@chakra-ui/react"
import { Styles } from "@chakra-ui/theme-tools"
import { Outfit } from "next/font/google"

export const font = Outfit({ subsets: ["latin"] })

const styles: Styles = {
    global: (): SystemStyleObject => ({
        body: {
            bg: "darkBlueBg",
            color: "white"
        },
        "body, #__next": {
            minHeight: "100vh"
        },
        "#__next": {
            display: "flex",
            flexDirection: "column"
        },
        "h1, h2, h3, h4": {
            fontWeight: "500 !important"
        }
    })
}

export default styles

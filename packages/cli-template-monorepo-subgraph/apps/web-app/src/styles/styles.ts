import { SystemStyleObject } from "@chakra-ui/react"
import { Styles } from "@chakra-ui/theme-tools"
import { Outfit } from "next/font/google"

export const font = Outfit({ subsets: ["latin"] })

const styles: Styles = {
    global: (): SystemStyleObject => ({
        body: {
            bg: "darkBlueBg",
            color: "text.100",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column"
        },
        "h1, h2, h3, h4": {
            fontWeight: "500 !important"
        },
        a: {
            color: "primary.400 !important"
        }
    })
}

export default styles

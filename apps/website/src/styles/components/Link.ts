import { SystemStyleObject } from "@chakra-ui/theme-tools"

const Link = {
    baseStyle: {
        _focus: {
            boxShadow: "none"
        },
        _hover: { textDecoration: "none" }
    },
    variants: {
        navlink: (): SystemStyleObject => ({
            borderBottomColor: "transparent",
            borderBottomWidth: "2px",
            pb: "5px",
            pt: "6px",
            _hover: { borderBottomColor: "ceruleanBlue" }
        }),
        buttonlink: (): SystemStyleObject => ({
            borderRadius: "100px",
            fontWeight: "500"
        })
    }
}

export default Link

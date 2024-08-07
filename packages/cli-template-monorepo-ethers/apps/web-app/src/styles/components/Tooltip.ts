import { SystemStyleObject } from "@chakra-ui/react"

const Tooltip = {
    baseStyle: (): SystemStyleObject => ({
        borderRadius: "4px",
        py: "10px",
        px: "15px",
        fontWeight: "bold",
        maxW: "350px"
    })
}

export default Tooltip

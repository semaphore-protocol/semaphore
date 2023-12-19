import { StyleFunctionProps, SystemStyleObject } from "@chakra-ui/theme-tools"
import { font } from "../styles"
import colors from "../colors"

const Button = {
    baseStyle: {
        _focus: {
            boxShadow: "none"
        },
        borderRadius: "100px",
        fontFamily: font.style.fontFamily,
        fontWeight: "400",
        paddingLeft: "18px !important",
        paddingRight: "18px !important"
    },
    defaultProps: {
        colorScheme: "#FFFFFF"
    },
    variants: {
        solid: (props: StyleFunctionProps): SystemStyleObject => {
            const { colorScheme: c } = props

            return {
                bg: c,
                color: colors.darkBlueBg,
                _hover: {
                    color: c,
                    bgGradient: colors.semaphore,
                    _disabled: {
                        bg: c
                    }
                }
            }
        },
        outline: (props: StyleFunctionProps): SystemStyleObject => {
            const { colorScheme: c } = props

            return {
                color: c,
                border: `1.2px solid ${c}`,
                _hover: {
                    bg: colors.darkBlueBg,
                    color: c,
                    border: `1.2px solid ${colors.primary["600"]}`,
                    _disabled: {
                        bg: c
                    }
                }
            }
        }
    }
}
export default Button

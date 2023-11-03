import { StyleFunctionProps, SystemStyleObject } from "@chakra-ui/theme-tools"
import { font } from "../styles"

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
        colorScheme: "white"
    },
    variants: {
        solid: (props: StyleFunctionProps): SystemStyleObject => {
            const { colorScheme: c } = props

            if (c === "primary") {
                // const bgGradient = "linear(to-r, primary.500, primary.800)"
                const bg = `${c}.500`
                const color = "white"

                return {
                    bg,
                    color,
                    _hover: {
                        bg: `${c}.800`,
                        _disabled: {
                            bg
                        }
                    },
                    _active: { bg: `${c}.800` }
                }
            }

            const bg = c

            return {
                bg,
                color: `darkBlue`,
                _hover: {
                    bg: `${c}.300`,
                    _disabled: {
                        bg
                    }
                },
                _active: { bg: `${c}.400` }
            }
        }
    }
}
export default Button

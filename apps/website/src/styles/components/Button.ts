import { StyleFunctionProps, SystemStyleObject } from "@chakra-ui/theme-tools"
import { font } from "../styles"

const Button = {
    baseStyle: {
        _focus: {
            boxShadow: "none"
        },
        borderRadius: "100px",
        fontFamily: font.style.fontFamily
    },
    defaultProps: {
        colorScheme: "white"
    },
    variants: {
        solid: (props: StyleFunctionProps): SystemStyleObject => {
            const { colorScheme: c } = props

            if (c === "primary") {
                const bg = "linear(to-r, primary.500, primary.800)"
                const color = "white"

                return {
                    bgGradient: bg,
                    color,
                    _hover: {
                        bg: "ceruleanBlue",
                        _disabled: {
                            bg
                        }
                    },
                    _active: { bg: `${c}.700` }
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

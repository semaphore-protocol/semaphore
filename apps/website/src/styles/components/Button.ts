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
                const bgGradient = "linear(to-r, primary.500, primary.800)"
                const color = "white"

                return {
                    bgGradient,
                    color,
                    transitionDuration: "200ms",
                    transitionTimingFunction: "linear",
                    _hover: {
                        bg: `${c}.800`,
                        _disabled: {
                            bgGradient
                        }
                    },
                    _active: { bg: `${c}.800` }
                }
            }

            const bg = c

            return {
                bg,
                color: `darkBlueBg`,
                transitionDuration: "200ms",
                transitionTimingFunction: "linear",
                _hover: {
                    bg: `primary.200`,
                    _disabled: {
                        bg
                    }
                },
                _active: { bg: `primary.200` }
            }
        },
        outline: (props: StyleFunctionProps): SystemStyleObject => {
            const { colorScheme: c } = props

            return {
                color: c,
                transitionDuration: "200ms",
                transitionTimingFunction: "linear",
                borderWidth: "1.2px",
                borderColor: c,
                _hover: {
                    color: c,
                    borderColor: "primary.200",
                    _disabled: {
                        bg: c
                    }
                }
            }
        }
    }
}
export default Button

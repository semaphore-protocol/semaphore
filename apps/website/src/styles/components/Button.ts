import { SystemStyleObject } from "@chakra-ui/react"
import { StyleFunctionProps } from "@chakra-ui/theme-tools"

const Button = {
    baseStyle: {
        _focus: {
            boxShadow: "none"
        },
        borderRadius: "4px"
    },
    defaultProps: {
        size: "lg"
    },
    variants: {
        solid: (props: StyleFunctionProps): SystemStyleObject => {
            const { colorScheme: c } = props

            if (c === "primary") {
                const bg = `${c}.500`
                const color = "white"

                return {
                    bg,
                    color,
                    _hover: {
                        bg: `${c}.600`,
                        _disabled: {
                            bg
                        }
                    },
                    _active: { bg: `${c}.700` }
                }
            }

            if (c === "gray") {
                const bg = `whiteAlpha.200`

                return {
                    bg,
                    _hover: {
                        bg: `whiteAlpha.300`,
                        _disabled: {
                            bg
                        }
                    },
                    _active: { bg: `whiteAlpha.400` }
                }
            }

            const bg = `${c}.200`

            return {
                bg,
                color: `gray.800`,
                _hover: {
                    bg: `${c}.300`,
                    _disabled: {
                        bg
                    }
                },
                _active: { bg: `${c}.400` }
            }
        },
        link: (): SystemStyleObject => ({
            _hover: {
                textDecoration: "none"
            }
        })
    }
}

export default Button

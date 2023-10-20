import { Container as _Container, ContainerProps } from "@chakra-ui/react"
import Footer from "./Footer"
import Navbar from "./Navbar"

export default function Container({ children }: ContainerProps) {
    return (
        <_Container maxW="1440px" px="20">
            <Navbar />
            {children}
            <Footer />
        </_Container>
    )
}

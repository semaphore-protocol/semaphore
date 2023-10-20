"use client"

import { Heading, Text, VStack } from "@chakra-ui/react"
import Container from "../components/Container"

export default function Home() {
    return (
        <Container>
            <VStack h="400" justify="center">
                <Heading as="h2" size="xl">
                    Anonymous interactions
                </Heading>
                <Text align="center">
                    Using zero knowledge, users can prove their group membership <br />
                    and send signals such as votes or endorsements without revealing their original identity.
                </Text>
            </VStack>
        </Container>
    )
}

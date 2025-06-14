import { Heading, Text, Card, CardBody, VStack } from "@chakra-ui/react"

export type InfoBlock = {
    title: string
    body: string
}

export type InfoCardProps = {
    texts: InfoBlock[]
}

export default function InfoCard({ texts }: InfoCardProps) {
    return (
        <Card
            bg="inherit"
            color="white"
            backdropFilter="blur(4px)"
            borderRadius="18px"
            border="1px"
            borderColor="white"
            padding="30px"
            width={{ base: "350px", md: "410px" }}
            height={{ base: "auto", md: "474px" }}
        >
            <CardBody padding="0">
                <VStack align="start" spacing="10" maxH="500" overflowY="auto">
                    {texts.map((text) => (
                        <VStack key={text.title} align="left">
                            <Heading textAlign="left" fontSize={{ base: "20px", md: "24px" }}>
                                {text.title}
                            </Heading>
                            <Text textAlign="left" fontSize={{ base: "14px", md: "16px" }}>
                                {text.body}
                            </Text>
                        </VStack>
                    ))}
                </VStack>
            </CardBody>
        </Card>
    )
}

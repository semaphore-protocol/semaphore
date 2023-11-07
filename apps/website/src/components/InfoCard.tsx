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
            width={"410px"}
            height={"474px"}
        >
            <CardBody padding="0">
                <VStack align="left" spacing="10" maxH="500" overflowY="auto">
                    {texts.map((text, i) => (
                        <VStack key={i} align="left">
                            <Heading fontSize="24px">{text.title}</Heading>
                            <Text fontSize="16px">{text.body}</Text>
                        </VStack>
                    ))}
                </VStack>
            </CardBody>
        </Card>
    )
}
import { Heading, Text, Card, CardBody, Stack, Flex, Link, Button } from "@chakra-ui/react"

export type ActionCardProps = {
    title: string
    description: string
    buttonText: string
    buttonUrl: string
}

export default function ActionCard({ title, description, buttonText, buttonUrl }: ActionCardProps) {
    return (
        <Card
            bg="darkBlue"
            textColor="white"
            borderRadius="24px"
            width={{ base: "full", xl: "1110px" }}
            direction={{ base: "column", lg: "row" }}
            p={{ base: "64px 32px", lg: "41px 80px" }}
        >
            <CardBody padding={0}>
                <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    direction={{ base: "column", md: "row" }}
                    gap={{ base: "2rem", md: "0" }}
                >
                    <Stack width={{ base: "full", md: "522px" }}>
                        <Heading
                            fontSize={{ base: "30px", md: "40px" }}
                            lineHeight="44px"
                            fontWeight="normal"
                            textColor="white"
                        >
                            {title}
                        </Heading>
                        <Text
                            mt="1rem"
                            fontSize={{ base: "16px", md: "20px" }}
                            lineHeight={{ base: "25px", md: "32px" }}
                            fontWeight="normal"
                            textColor="text.400"
                        >
                            {description}
                        </Text>
                    </Stack>
                    <Stack width={{ base: "full", md: "auto" }}>
                        <Link href={buttonUrl} isExternal>
                            <Button colorScheme="primary" size={{ base: "md", md: "lg" }}>
                                {buttonText}
                            </Button>
                        </Link>
                    </Stack>
                </Flex>
            </CardBody>
        </Card>
    )
}

import { Heading, Text, Card, CardBody, Stack, Flex, Link } from "@chakra-ui/react"

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
                            textColor="alabaster.400"
                        >
                            {description}
                        </Text>
                    </Stack>
                    <Stack width={{ base: "full", md: "auto" }}>
                        <Link
                            href={buttonUrl}
                            isExternal
                            variant="buttonlink"
                            bg="semaphore"
                            w="fit-content"
                            lineHeight="24px"
                            fontSize={{ base: "14px", md: "18px", lg: "20px" }}
                            textColor="white"
                            padding="14px 16px"
                            _hover={{ opacity: "85%" }}
                        >
                            {buttonText}
                        </Link>
                    </Stack>
                </Flex>
            </CardBody>
        </Card>
    )
}

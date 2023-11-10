import { Heading, Text, Card, CardBody, Stack, Button, Flex } from "@chakra-ui/react"

export type ActionCardProps = {
    title: string
    description: string
    buttonText: string
}

export default function ActionCard({ title, description, buttonText }: ActionCardProps) {
    return (
        <Card
            bg="darkBlue"
            textColor="white"
            borderRadius="24px"
            width={{ base: "full", xl: "1110px" }}
            height={{ base: "full", xl: "244px" }}
            direction={{ base: "column", xl: "row" }}
            p={{ base: "64px 32px", xl: "41px 80px" }}
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
                        <Button
                            bg="semaphore"
                            w="fit-content"
                            lineHeight="24px"
                            fontSize={{ base: "14px", md: "18px", lg: "20px" }}
                            textColor="white"
                            padding="1.5rem 2rem"
                            _hover={{ opacity: "85%" }}
                        >
                            {buttonText}
                        </Button>
                    </Stack>
                </Flex>
            </CardBody>
        </Card>
    )
}

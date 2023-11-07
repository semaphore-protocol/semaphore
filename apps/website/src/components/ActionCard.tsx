import { Heading, Text, Card, CardBody, Stack, Button, Flex } from "@chakra-ui/react"

export type ActionCardProps = {
    title: string
    description: string
    buttonText: string
}

export default function ActionCard({ title, description, buttonText }: ActionCardProps) {
    return (
        <Card
            bg={"darkBlue"}
            textColor={"white"}
            borderRadius={"24px"}
            width={{ base: "full", xl: "1110px" }}
            height={{ base: "full", xl: "244px" }}
            direction={{ base: "column", dm: "row" }}
        >
            <CardBody padding={0} m={"41px 80px"}>
                <Flex
                    justifyContent={"space-between"}
                    alignItems={"center"}
                    direction={{ base: "column", md: "row" }}
                    gap={{ base: "2rem", md: "0" }}
                >
                    <Stack width={{ base: "full", md: "522px" }}>
                        <Heading fontSize={"40px"} lineHeight={"44px"} fontWeight={"normal"} textColor={"white"}>
                            {title}
                        </Heading>
                        <Text
                            mt={"1rem"}
                            fontSize={"20px"}
                            lineHeight={"32px"}
                            fontWeight={"normal"}
                            textColor={"alabaster.400"}
                        >
                            {description}
                        </Text>
                    </Stack>
                    <Stack>
                        <Button
                            bg={"semaphore"}
                            lineHeight={"24px"}
                            fontSize={"20px"}
                            textColor={"white"}
                            padding={"1.5rem 2rem"}
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

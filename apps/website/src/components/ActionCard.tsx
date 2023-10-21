import { Heading, Text, Card, CardBody, Stack, Button, Flex } from "@chakra-ui/react"

export type ActionCardProps = {
    title: string
    description: string
    buttonText: string
}

export default function ActionCard({ title, description, buttonText }: ActionCardProps) {
    return (
        <Card
            bg={"white"}
            textColor={"darkBlue1"}
            borderRadius={"24px"}
            padding={{ base: "30px 50px", sm: "40px 60px", md: "50px 70px", lg: "60px 80px" }}
            width={{ base: "full", xl: "1110px" }}
            direction={{ base: "column", dm: "row" }}
        >
            <CardBody padding={0}>
                <Flex
                    justifyContent={"space-between"}
                    alignItems={"center"}
                    direction={{ base: "column", md: "row" }}
                    gap={{ base: "2rem", md: "0" }}
                >
                    <Stack width={{ base: "full", md: "522px" }}>
                        <Heading fontSize={"40px"} lineHeight={"44px"} fontWeight={"normal"} textColor={"darkBlueBg"}>
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

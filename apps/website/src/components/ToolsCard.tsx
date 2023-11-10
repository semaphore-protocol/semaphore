import {
    Heading,
    Text,
    HStack,
    Card,
    CardBody,
    List,
    ListItem,
    VStack,
    StackDivider,
    Box,
    Button,
    Flex
} from "@chakra-ui/react"
import IconChevronRight from "@/icons/IconChevronRight"

export type ToolsCardProps = {
    icon: any
    title: string
    subtitle: string
    details: string[]
}

export default function ToolsCard({ icon, title, subtitle, details }: ToolsCardProps) {
    return (
        <Card
            bg="darkBlue"
            borderRadius="16px"
            color="white"
            border="1px"
            borderColor="alabaster.950"
            padding="32px"
            width={{ base: "full", lg: "348px" }}
            height={{ base: "auto", lg: "501px" }}
        >
            <HStack mb="2rem">{icon}</HStack>
            <CardBody padding={0}>
                <VStack divider={<StackDivider borderColor="alabaster.950" />} spacing="24px" align="stretch">
                    <Box>
                        <Heading fontSize="40px" fontWeight="normal">
                            {title}
                        </Heading>
                        <Button
                            mt="24px"
                            w="full"
                            bg="semaphore"
                            color="white"
                            fontSize="18px"
                            fontWeight="medium"
                            _hover={{ bg: "semaphore", opacity: "85%" }}
                        >
                            Select tool
                        </Button>
                    </Box>
                    <Box>
                        <Text fontSize="12px" textTransform="uppercase" fontWeight="semibold">
                            {subtitle}
                        </Text>

                        <List spacing="14px" mb="2rem" mt="24px">
                            {details.map((elem) => (
                                <ListItem key={elem}>
                                    <Flex>
                                        <HStack alignItems="start" mt="8px">
                                            <IconChevronRight height={2} width={2} color="ceruleanBlue" />
                                        </HStack>
                                        <Text display="inline-block" ml="8px" fontSize="14px" lineHeight="22.4px">
                                            {elem}
                                        </Text>
                                    </Flex>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </VStack>
            </CardBody>
        </Card>
    )
}

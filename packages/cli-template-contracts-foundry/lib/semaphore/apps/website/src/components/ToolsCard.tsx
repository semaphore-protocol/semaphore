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
    Link,
    Flex,
    Button
} from "@chakra-ui/react"
import IconChevronRight from "@/icons/IconChevronRight"

export type ToolsCardProps = {
    icon: any
    title: string
    subtitle: string
    details: string[]
    url: string
}

export default function ToolsCard({ icon, title, subtitle, details, url }: ToolsCardProps) {
    return (
        <Card
            bg="darkBlue"
            borderRadius="16px"
            color="white"
            border="1px"
            borderColor="text.950"
            padding="32px"
            width={{ base: "full", lg: "348px" }}
            height={{ base: "auto", lg: "501px" }}
        >
            <HStack mb="2rem">{icon}</HStack>
            <CardBody padding={0}>
                <VStack divider={<StackDivider borderColor="text.950" />} spacing="24px" align="stretch">
                    <Box>
                        <Heading fontSize="40px" fontWeight="normal">
                            {title}
                        </Heading>
                        <Link href={url} isExternal>
                            <Button w="full" colorScheme="primary" size={{ base: "md", md: "lg" }} mt="6">
                                Select tool
                            </Button>
                        </Link>
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
                                            <IconChevronRight height={2} width={2} color="primary.600" />
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

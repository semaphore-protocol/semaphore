"use client"

import { Text, VStack, Flex, Link } from "@chakra-ui/react"
import IconArrowRight from "@/icons/IconArrowRight"
import CodekBlock from "./CodeBlock"

export type SectionItem = {
    icon: any
    heading: string
    body: string
}

export type SectionBlockProps = {
    title: string
    description: string
    linkText: string
    linkUrl: string
    codeText: string
    itemList: SectionItem[]
}

export default function SectionBlock({ title, description, linkText, linkUrl, codeText, itemList }: SectionBlockProps) {
    return (
        <VStack w="full">
            <Flex flexDir={{ base: "column", lg: "row" }} gap="52px" w="full">
                <VStack align="start" gap="32px" flex="1">
                    <Text fontSize={{ base: "40px", md: "44px" }} fontWeight={{ base: "400", md: "500" }}>
                        {title}
                    </Text>
                    <Text fontSize={{ base: "16px", md: "18px" }} textColor="text.400">
                        {description}
                    </Text>
                    <Link display="flex" alignItems="center" gap="10px" justifyItems="center" href={linkUrl} isExternal>
                        <Text
                            borderBottomWidth="2px"
                            borderBottomColor="white"
                            _hover={{ borderBottomColor: "primary.600" }}
                            fontSize="18px"
                            fontWeight="400"
                        >
                            {linkText}
                        </Text>
                        <IconArrowRight width="14px" />
                    </Link>
                </VStack>

                <CodekBlock text={codeText} />
            </Flex>
            <Flex mt="80px" gap="40px" justify="start" alignItems="center" wrap={{ base: "wrap", xl: "nowrap" }}>
                {itemList.map((item) => (
                    <VStack key={item.heading} alignItems="start">
                        <VStack>{item.icon}</VStack>
                        <Text fontSize="24px">{item.heading}</Text>
                        <Text fontSize="16px" color="text.400">
                            {item.body}
                        </Text>
                    </VStack>
                ))}
            </Flex>
        </VStack>
    )
}

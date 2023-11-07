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
        <VStack>
            <Flex justify={"space-around"} gap={"52px"}>
                <VStack alignItems={"start"} gap={"32px"}>
                    <Text fontSize={"44px"}>{title}</Text>
                    <Text w={"602px"} fontSize={"18px"} textColor={"alabaster.400"}>
                        {description}
                    </Text>
                    <Link
                        display={"flex"}
                        alignItems={"center"}
                        gap={"10px"}
                        justifyItems={"center"}
                        href={linkUrl}
                        isExternal
                    >
                        <Text
                            borderBottomWidth={"1px"}
                            borderBottomColor={"white"}
                            _hover={{ borderBottomColor: "transparent" }}
                            fontSize="18px"
                            fontWeight="normal"
                        >
                            {linkText}
                        </Text>
                        <IconArrowRight width="14px" />
                    </Link>
                </VStack>
                <CodekBlock text={codeText} />
            </Flex>
            <Flex mt={"80px"} gap={"40px"} justify={"start"} alignItems={"center"}>
                {itemList.map((item, i) => (
                    <VStack key={i} alignItems={"start"}>
                        <VStack>{item.icon}</VStack>
                        <Text fontSize={"24px"}>{item.heading}</Text>
                        <Text fontSize={"16px"} color={"alabaster.400"}>
                            {item.body}
                        </Text>
                    </VStack>
                ))}
            </Flex>
            <VStack></VStack>
        </VStack>
    )
}

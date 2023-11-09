import { Heading, Text, HStack, Tag, Card, CardBody } from "@chakra-ui/react"

export type ProjectCardProps = {
    categories: string[]
    title: string
    description: string
}

export default function ProjectCard({ categories, title, description }: ProjectCardProps) {
    return (
        <Card
            bg={"darkBlue"}
            borderRadius={"18px"}
            color={"white"}
            border={"1px"}
            borderColor={"alabaster.950"}
            padding={"55px 34px 55px 34px"}
            width="full"
            height={"284.86px"}
            _hover={{ borderColor: "ceruleanBlue" }}
        >
            <HStack gap={"8px"} mb={"2rem"}>
                {categories.map((category, i) => (
                    <Tag variant="outline" key={i}>
                        {category}
                    </Tag>
                ))}
            </HStack>
            <CardBody padding={0}>
                <Heading fontSize={"24px"} lineHeight={"33px"}>
                    {title}
                </Heading>
                <Text mt={"1rem"} gap={"10px"} fontSize={"14px"} lineHeight={"22.4px"}>
                    {description}
                </Text>
            </CardBody>
        </Card>
    )
}

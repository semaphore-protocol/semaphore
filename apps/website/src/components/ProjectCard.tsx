import { Card, CardBody, HStack, Heading, Link, LinkProps, Tag, Text } from "@chakra-ui/react"

export type ProjectCardProps = {
    categories: string[]
    title: string
    description: string
    url?: string
}

export default function ProjectCard({ categories, title, description, url, ...props }: ProjectCardProps & LinkProps) {
    return (
        <Link href={url} isExternal h="full" {...props}>
            <Card
                bg="darkBlue"
                borderRadius="18px"
                color="white"
                border="1px"
                borderColor="alabaster.950"
                padding="55px 34px 55px 34px"
                w="full"
                h="full"
                _hover={{ borderColor: "ceruleanBlue" }}
            >
                <HStack gap="8px" mb="2rem" wrap="wrap">
                    {categories.map((category) => (
                        <Tag variant="outline" key={category}>
                            {category}
                        </Tag>
                    ))}
                </HStack>
                <CardBody padding={0}>
                    <Heading fontSize="24px" lineHeight="33px">
                        {title}
                    </Heading>
                    <Text mt="1rem" gap="10px" fontSize="14px" lineHeight="22.4px">
                        {description}
                    </Text>
                </CardBody>
            </Card>
        </Link>
    )
}

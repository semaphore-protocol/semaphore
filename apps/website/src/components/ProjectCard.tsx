import { Card, CardBody, CardFooter, HStack, Heading, Link, LinkProps, Tag, Text } from "@chakra-ui/react"
import IconDiscord from "../icons/IconDiscord"
import IconGithub from "../icons/IconGithub"
import IconWebsite from "../icons/IconWebsite"

export type ProjectCardProps = {
    categories: string[]
    title: string
    description: string
    url?: string
    githubUrl?: string
    discordUrl?: string
}

export default function ProjectCard({
    categories,
    title,
    description,
    url,
    githubUrl,
    discordUrl,
    ...props
}: ProjectCardProps & LinkProps) {
    return (
        <Card
            bg="darkBlue"
            borderRadius="18px"
            color="white"
            border="1px"
            borderColor="alabaster.950"
            padding="34px"
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
            {(url || githubUrl || discordUrl) && (
                <CardFooter pb="0" pl="0">
                    <HStack>
                        {githubUrl && (
                            <Link href={githubUrl} isExternal>
                                <IconGithub boxSize={{ base: "16px", md: "24px" }} />
                            </Link>
                        )}
                        {url && (
                            <Link href={url} isExternal>
                                <IconWebsite boxSize={{ base: "16px", md: "24px" }} />
                            </Link>
                        )}
                        {discordUrl && (
                            <Link href={discordUrl} isExternal>
                                <IconDiscord boxSize={{ base: "16px", md: "24px" }} />
                            </Link>
                        )}
                    </HStack>
                </CardFooter>
            )}
        </Card>
    )
}

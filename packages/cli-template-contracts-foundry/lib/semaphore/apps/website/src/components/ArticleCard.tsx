import { Heading, Text, Card, CardBody, CardFooter, Link } from "@chakra-ui/react"

export type ArticleCardProps = {
    title: string
    minRead: number
    url: string
}

export default function ArticleCard({ title, minRead, url }: ArticleCardProps) {
    return (
        <Link href={url} isExternal>
            <Card
                bg="transparent"
                borderRadius="10px"
                color="white"
                padding="24px 20px"
                width={{ base: "full", sm: "297.5px" }}
                h="full"
                variant="unstyled"
                borderWidth="1px"
                borderColor="text.900"
                _hover={{ bgColor: "darkBlueBg", borderColor: "transparent" }}
            >
                <CardBody padding="0">
                    <Heading fontSize="20px" lineHeight="28px">
                        {title}
                    </Heading>
                </CardBody>
                <CardFooter paddingTop="8">
                    <Text fontSize="14px" lineHeight="22.4px">
                        {`${minRead} min read`}
                    </Text>
                </CardFooter>
            </Card>
        </Link>
    )
}

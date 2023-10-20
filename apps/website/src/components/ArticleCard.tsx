import { Heading, Text, Card, CardBody, CardFooter } from "@chakra-ui/react"

export type ArticleCardProps = {
    title: string
    minRead: number
}

export default function ArticleCard({ title, minRead }: ArticleCardProps) {
    return (
        <Card
            bg={"transparent"}
            borderRadius={"10px"}
            color={"white"}
            padding={"24px 20px"}
            width={{ base: "full", sm: "297.5px" }}
            height={"210px"}
            _hover={{ bgColor: "darkBlue1" }}
        >
            <CardBody padding={0}>
                <Heading fontSize={"20px"} lineHeight={"28px"}>
                    {title}
                </Heading>
            </CardBody>
            <CardFooter padding={0}>
                <Text fontSize={"14px"} lineHeight={"22.4px"}>
                    {`${minRead} min read`}
                </Text>
            </CardFooter>
        </Card>
    )
}

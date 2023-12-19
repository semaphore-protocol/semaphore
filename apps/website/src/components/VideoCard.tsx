import { Heading, Card, CardBody, Image, AspectRatio, HStack, Link } from "@chakra-ui/react"

export type VideoCardProps = {
    thumbnail: string
    url: string
    title: string
}

export default function VideoCard({ thumbnail, url, title }: VideoCardProps) {
    return (
        <Link href={url} isExternal>
            <Card
                bg="transparent"
                borderRadius="10px"
                color="white"
                width="297px"
                height="320px"
                _hover={{ bgColor: "darkBlueBg" }}
            >
                <HStack borderRadius="10px 10px 0px 0px">
                    <AspectRatio width="297px" height="215px" borderRadius="10px" overflow="hidden">
                        <Image alt="Youtube thumbnail" src={thumbnail} />
                    </AspectRatio>
                </HStack>
                <CardBody padding="0px 20px 20px 20px">
                    <Heading fontSize={{ base: "18px", md: "20px" }} lineHeight="28px" fontWeight="normal">
                        {title}
                    </Heading>
                </CardBody>
            </Card>
        </Link>
    )
}

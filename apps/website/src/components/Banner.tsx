import { Box, Text } from "@chakra-ui/react"

interface BannerProps {
    children: React.ReactNode
}

export default function Banner({ children }: BannerProps) {
    return (
        <Box
            bg="darkBlueBg"
            py="3"
            textAlign="center"
            borderBottom="1px solid"
            color="text"
            fontSize="sm"
            position="fixed"
            top="0"
            left="0"
            right="0"
            zIndex="2"
            display="flex"
            justifyContent="center"
            alignItems="center"
        >
            <Text>{children}</Text>
        </Box>
    )
}

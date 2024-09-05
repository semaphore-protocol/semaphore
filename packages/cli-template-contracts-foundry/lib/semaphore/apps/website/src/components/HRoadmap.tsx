import { Box, Text } from "@chakra-ui/react"
import roadmap from "../data/roadmap.json"
import IconInnerCheck from "../icons/IconInnerCheck"

export default function HRoadmap() {
    return roadmap.map((milestone, i) => (
        <Box
            key={milestone.name}
            borderBottomWidth={i % 2 === 0 ? "5px" : "0px"}
            borderTopWidth={i % 2 !== 0 ? "5px" : "0px"}
            borderLeftWidth="1px"
            borderColor="#1E46F2"
            transform={i % 2 === 0 ? "translateY(-74px)" : ""}
            h="80px"
            w="full"
            pos="relative"
        >
            {milestone.done ? (
                <IconInnerCheck
                    pos="absolute"
                    top={i % 2 !== 0 ? "-14px" : "inherit"}
                    bottom={i % 2 === 0 ? "-14px" : "inherit"}
                    left="-12px"
                    bg="#1E46F2"
                    borderRadius="50px"
                    p="7px"
                    w="24px"
                    h="24px"
                    color="white"
                />
            ) : (
                <Box
                    pos="absolute"
                    top={i % 2 !== 0 ? "-14px" : "inherit"}
                    bottom={i % 2 === 0 ? "-14px" : "inherit"}
                    left="-12px"
                    bg="darkBlueBg"
                    borderWidth="5px"
                    borderColor="#1E46F2"
                    borderRadius="50px"
                    w="24px"
                    h="24px"
                />
            )}
            <Text
                pos="absolute"
                bg="darkBlueBg"
                fontSize="14px"
                py="5px"
                top={i % 2 === 0 ? "-35px" : "inherit"}
                bottom={i % 2 !== 0 ? "-35px" : "inherit"}
                left="-1px"
            >
                {milestone.name}
            </Text>
        </Box>
    ))
}

import { Box, Text } from "@chakra-ui/react"
import roadmap from "../data/roadmap.json"
import IconInnerCheck from "../icons/IconInnerCheck"

export default function VRoadmap() {
    return roadmap.map((milestone, i) => (
        <Box
            key={milestone.name}
            ml="-74px"
            borderLeftWidth={i % 2 === 0 ? "5px" : "0px"}
            borderRightWidth={i % 2 !== 0 ? "5px" : "0px"}
            borderTopWidth="1px"
            borderColor="#1E46F2"
            transform={i % 2 === 0 ? "translateX(74px)" : ""}
            h="80px"
            w="80px"
            pos="relative"
        >
            {milestone.done ? (
                <IconInnerCheck
                    pos="absolute"
                    right={i % 2 !== 0 ? "-14px" : "inherit"}
                    left={i % 2 === 0 ? "-14px" : "inherit"}
                    top="-12px"
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
                    right={i % 2 !== 0 ? "-14px" : "inherit"}
                    left={i % 2 === 0 ? "-14px" : "inherit"}
                    top="-12px"
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
                w="140px"
                px="16px"
                textAlign={i % 2 === 0 ? "left" : "right"}
                left={i % 2 === 0 ? "70px" : "inherit"}
                right={i % 2 !== 0 ? "70px" : "inherit"}
                top="-5px"
            >
                {milestone.name}
            </Text>
        </Box>
    ))
}

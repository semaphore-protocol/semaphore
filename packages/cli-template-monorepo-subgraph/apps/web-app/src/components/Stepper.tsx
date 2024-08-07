"use client"

import { Button, HStack, Text } from "@chakra-ui/react"
import IconChevronLeft from "../icons/IconChevronLeft"
import IconChevronRight from "../icons/IconChevronRight"

export type StepperProps = {
    step: number
    onPrevClick?: () => void
    onNextClick?: () => void
}

export default function Stepper({ step, onPrevClick, onNextClick }: StepperProps) {
    return (
        <HStack width="full" justify="space-between" pt="6">
            <Button
                flex="1"
                leftIcon={<IconChevronLeft />}
                justifyContent="left"
                colorScheme="primary"
                variant="link"
                disabled={!onPrevClick}
                onClick={onPrevClick || undefined}
                size="lg"
                visibility={onPrevClick ? "visible" : "hidden"}
            >
                Prev
            </Button>

            <Text textAlign="center" flex="1">
                {step.toString()}/3
            </Text>

            <Button
                flex="1"
                rightIcon={<IconChevronRight />}
                justifyContent="right"
                colorScheme="primary"
                variant="link"
                disabled={!onNextClick}
                onClick={onNextClick || undefined}
                size="lg"
                visibility={onNextClick ? "visible" : "hidden"}
            >
                Next
            </Button>
        </HStack>
    )
}

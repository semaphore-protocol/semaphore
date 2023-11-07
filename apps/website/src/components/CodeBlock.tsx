import { Flex, useClipboard, Button } from "@chakra-ui/react"
import { CodeBlock, ocean } from "react-code-blocks"

export type CodekBlockProps = {
    text: string
}

export default function CodekBlock({ text }: CodekBlockProps) {
    const { onCopy, hasCopied } = useClipboard(text)

    const copyBlockProps = {
        text,
        language: "ts",
        showLineNumbers: false,
        wrapLines: true,
        theme: ocean,
        customStyle: { background: "transparent", overflow: "auto", paddingRight: "70px" }
    }
    return (
        <Flex
            overflow={"auto"}
            gap={"200px"}
            justify={"space-around"}
            w={"602px"}
            h={"auto"}
            position={"relative"}
            p={"24px"}
            borderRadius={"8px"}
            backgroundColor={"darkBlue"}
        >
            <CodeBlock {...copyBlockProps} />
            <Button
                textColor={"alabaster.300"}
                fontSize={"18px"}
                fontWeight={"400"}
                borderColor={"alabaster.800"}
                backgroundColor={"darkBlue"}
                padding={"5px 8px"}
                border={"1px"}
                borderRadius={"4px"}
                onClick={onCopy}
                position={"absolute"}
                right={"24px"}
            >
                {hasCopied ? "copied!" : "copy"}
            </Button>
        </Flex>
    )
}
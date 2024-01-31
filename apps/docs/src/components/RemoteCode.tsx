import React, { useEffect, useState } from "react"
import CodeBlock from "@theme/CodeBlock"

export default function RemoteCode({ url, language, title }: { url: string; language: string; title: string }) {
    const [code, setCode] = useState<string>("")

    useEffect(() => {
        fetch(url)
            .then((response) => response.text())
            .catch(() => "")
            .then((text) => setCode(text))
    }, [url])

    return (
        <div>
            <CodeBlock language={language} title={title} showLineNumbers>
                {code}
            </CodeBlock>
        </div>
    )
}

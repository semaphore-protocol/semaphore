import React, { useEffect, useState } from "react"

export default function Articles() {
    const [articles, setArticles] = useState<any[]>([])

    useEffect(() => {
        fetch("https://raw.githubusercontent.com/semaphore-protocol/semaphore/main/apps/website/src/data/articles.json")
            .then((response) => response.json())
            .catch(() => [])
            .then(setArticles)
    }, [])

    return (
        <ul>
            {articles.map((article) => (
                <li key={article.url + article.title}>
                    <a href={article.url} target="_blank" rel="noreferrer">
                        {article.title}
                    </a>{" "}
                    - {article.authors.join(", ")} (<i>{article.date}</i>)
                </li>
            ))}
        </ul>
    )
}

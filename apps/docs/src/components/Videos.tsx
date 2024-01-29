import React, { useEffect, useState } from "react"

export default function Videos() {
    const [videos, setVideos] = useState<any[]>([])

    useEffect(() => {
        fetch("https://raw.githubusercontent.com/semaphore-protocol/semaphore/main/apps/website/src/data/videos.json")
            .then((response) => response.json())
            .then(setVideos)
    }, [])

    return (
        <ul>
            {videos.map((video) => (
                <li key={video.url + video.title}>
                    <a href={video.url} target="_blank" rel="noreferrer">
                        {video.title}
                    </a>{" "}
                    - {video.speakers.join(", ")} at <u>{video.eventName}</u> (<i>{video.date}</i>)
                </li>
            ))}
        </ul>
    )
}

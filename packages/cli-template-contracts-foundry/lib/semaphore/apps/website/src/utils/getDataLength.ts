import projects from "../data/projects.json"
import videos from "../data/videos.json"
import articles from "../data/articles.json"

export function getDataLength(type: "projects" | "videos" | "articles"): number {
    switch (type) {
        case "projects":
            return projects.length
        case "videos":
            return videos.length
        case "articles":
            return articles.length
        default:
            return 0
    }
}

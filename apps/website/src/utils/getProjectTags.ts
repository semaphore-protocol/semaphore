import type Projects from "../data/projects-mock.json"

/**
 * Iterates over a list of project objects, each with its own collection of tags,
 * and compiles a unique set of all tags encountered across these projects.
 * It ensures that each tag is only listed once, regardless of how
 * many projects the tag is associated with.
 * @param projects An array of objects where each object represents a project.
 * @returns An array of strings, where each string is a unique tag from across all projects.
 */
export function getProjectTags(projects: typeof Projects): string[] {
    const tags = projects.flatMap((project) => project.tags)

    return Array.from(new Set(tags))
}

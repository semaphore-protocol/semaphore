import type Projects from "../data/projects.json"

/**
 * Iterates over a list of project objects, each with its own collection of categories,
 * and compiles a unique set of all categories encountered across these projects.
 * It ensures that each category is only listed once, regardless of how
 * many projects the category is associated with.
 * @param projects An array of objects where each object represents a project.
 * @returns An array of strings, where each string is a unique category from across all projects.
 */
export function getProjectCategories(projects: typeof Projects): string[] {
    const categories = projects.flatMap((project) => project.categories).filter((category) => category !== "")

    return Array.from(new Set(categories))
}

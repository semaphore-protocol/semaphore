export type SortType = "asc" | "desc"

function propComparator(propName: string, sortType: SortType) {
    return (a: any, b: any) => {
        const elem1 = new Date(a[propName]).valueOf()
        const elem2 = new Date(b[propName]).valueOf()

        if (elem1 === elem2) {
            return 0
        }

        if (sortType === "asc") {
            return elem1 < elem2 ? -1 : 1
        }

        return elem1 > elem2 ? -1 : 1
    }
}

/**
 * Sort an array using a specific property and type descending or ascending.
 * @param elems An array of objects with the property propName.
 * @param propName A string which represents the property that will be used to sort.
 * @param sortType The type that will be used to sort, it can be ascending or descending.
 * @returns The initial array sorted.
 */
export function sortByDate(elems: any[], propName: string = "date", sortType: SortType = "desc") {
    return elems.sort(propComparator(propName, sortType))
}

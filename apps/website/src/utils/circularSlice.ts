/**
 * Extracts a specified number of elements from an input list, starting
 * from a given index, in a circular manner. If the end of the list is
 * reached before the desired number of elements are extracted, the
 * function will wrap around and continue extracting from the beginning
 * of the list, thus behaving like a circular list or ring buffer.
 * @param list The input list from which elements are to be extracted.
 * @param index The starting position in the list from where the extraction begins.
 * @param The number of elements to extract from the list.
 * @returns A new array containing the extracted elements.
 */
export function circularSlice(list: any[], index: number, numberOfItems: number): any[] {
    // Return empty array for empty input or non-positive count to avoid NaN index access
    if (list.length === 0 || numberOfItems <= 0) {
        return []
    }
    const result = []

    for (let i = 0; i < numberOfItems; i += 1) {
        result.push(list[(index + i) % list.length])
    }

    return result
}

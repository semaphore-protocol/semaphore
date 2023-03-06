// eslint-disable-next-line import/prefer-default-export
export function jsDateToGraphqlDate(date: Date): number {
    return Math.round(date.getTime() / 1000)
}

export type ErrorResponseType = Error & {
    code?: string
    errno?: number
};
export type methodType = 'run' | 'get' | 'all'

export type endpointType = 'dbRun' | 'dbGet' | 'dbAll'

export type verbType = 'create' | 'read' | 'update' | 'delete'

export type queryType = { verb: verbType, sql: string, values?: any[]}

export type queryObjectType = {
    query_type: string,
    sql: string,
    status: string,
    error_code: string | null,
    error_message: string | null,
}
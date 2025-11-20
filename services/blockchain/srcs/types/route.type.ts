export type RouteType = {
	method: 'GET' | 'POST' | 'DELETE' | 'PUT'
	pathName: string
	handler: (params?: URLSearchParams) => Response
}

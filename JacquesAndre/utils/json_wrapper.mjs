export function json_parse(json)
{
	try
	{
		const obj = JSON.parse(json)
		return obj
	}
	catch(e)
	{
		console.error("json_parse: ", e)
		return undefined
	}
}

export function json_stringify(obj)
{
	return JSON.stringify(obj)
}

// export function json_parse(json:string) : Object | undefined
// {
// 	try
// 	{
// 		const obj = JSON.parse(json)
// 		return obj
// 	}
// 	catch(e)
// 	{
// 		console.error("json_parse: ", e)
// 		return undefined
// 	}
// }

// export function json_stringify(obj:Object)
// {
// 	return JSON.stringify(obj)
// }

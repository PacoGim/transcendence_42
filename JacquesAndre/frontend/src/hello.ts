export default function hello(element: HTMLDivElement)
{
	fetch("https://localhost:3000/api/hello")
		.then(res=>res.json())
		.then(json=>element.innerText = JSON.stringify(json))
		.catch(e=>console.error(e))
}

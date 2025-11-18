


export const color = {
color1: "#00FF00",
color2 : "#FF0000",
colorBall : "#FFFF00",
color1Comp :  "#FF00FF",
color2Comp : "#00FFFF",
colorBallComp : "#0000FF",
toggleColor
}

function colorContrasted(hex: any)
{
	const r = parseInt(hex.slice(1, 3), 16)
	const g = parseInt(hex.slice(3, 5), 16)
	const b = parseInt(hex.slice(5, 7), 16)
	const rComp = 255 - r
	const gComp = 255 - g
	const bComp = 255 - b
	const compColor = `rgb(${rComp},${gComp},${bComp})`
	return compColor
}

function randomColor()
{
	const random = Math.floor(Math.random() * 0xffffff);
	const hex = random.toString(16).padStart(6, "0");
	return `#${hex}`;
}

function toggleColor()
{
	color.color1 = randomColor()
	color.color1Comp = colorContrasted(color.color1)
	color.color2 = randomColor()
	color.color2Comp = colorContrasted(color.color2)
	color.colorBall = randomColor()
	color.colorBallComp = colorContrasted(color.colorBall)
}


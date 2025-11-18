import './styles/chat.css'
// import "./app/ChatAppElement.ts"



import chat from './chat.ts'
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div id="chat"></div>
`

chat(document.querySelector<HTMLDivElement>('#chat')!)

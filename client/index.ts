import WebSocket from 'ws'

const ws = new WebSocket('ws://localhost:8000')

ws.on('open', () => {
  ws.send('Client => Server')
})

ws.on('message', (data) => {
  console.log(data)
})

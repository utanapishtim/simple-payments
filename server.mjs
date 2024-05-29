import express from 'express'
import ws, { WebSocketServer } from 'ws'
import { parse } from 'url'
import next from 'next'
import handleSocket from './lib/handler.mjs'
 
const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000

const web = next({ dev, hostname, port })
const handle = web.getRequestHandler()
 
web.prepare().then(() => {
  const app = express()

  app.all('*', (req, res) => {
    const parsed = parse(req.url, true)
    if (!parsed.pathname.startsWith('/api')) handle(req, res, parsed)
  })

  const wss = new WebSocketServer({ noServer: true })

  const server = app.listen(port)
  server.on('upgrade', (req, socket, head) => {
    if (parse(req.url, true).pathname !== '/_next/webpack-hmr') {
      wss.handleUpgrade(req, socket, head, handleSocket)
    }
  })
})
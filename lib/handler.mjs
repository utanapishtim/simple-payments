import b4a from 'b4a' // util for working with bytes on server and client
import FramedStream from 'framed-stream' // length prefixed buffer stream
import Protomux from 'protomux' // multiplex many protocols over a single transmission protocol
import RPC from 'protomux-rpc' // little rpc library
import cenc from 'compact-encoding' // binary encoders for efficient wire transfer
import { sql, eq, or } from 'drizzle-orm'

import WebSocketStream from './websocket-stream.mjs' // turn websocket into a stream
import { db } from './db.mjs'
import { accounts } from './schema.mjs'

const conns = new Map() // active connections

export default function handleSocket (socket) {
  // wrap our transmission protocol
  const ws = new WebSocketStream(socket)
  const framed = new FramedStream(ws)
  const mux = Protomux.from(framed)
  const rpc = new RPC(mux)

  // logic to initialize a client
  rpc.respond('init', { 
    requestEncoding: cenc.fixed32, 
    responseEncoding: cenc.json 
  }, async (buf) => {
    // create the id for the client and initialize some connection state
    const keystr = b4a.toString(buf, 'hex')
    conns.set(keystr, rpc)
    socket.once('close', () => conns.delete(keystr))

    const [account] = await db.transaction(async (tx) => {
      const exists = await tx
        .select({ balance: accounts.balance })
        .from(accounts)
        .where(eq(accounts.id, keystr))
      if (!exists.length) await tx.insert(accounts).values({ id: keystr, balance: 0 })

      return tx
        .select({ balance: accounts.balance })
        .from(accounts)
        .where(eq(accounts.id, keystr))
    })
    return account
  })

  // logic to send funds from one account to the other
  rpc.respond('send', {
    requestEncoding: cenc.json,
    responseEncoding: cenc.json
  }, async ({ from, to, amount }) => {
    const results = await db.transaction(async (tx) => {
      const accts = await tx
        .select({ id: accounts.id, balance: accounts.balance })
        .from(accounts)
        .where(or(eq(accounts.id, from), eq(accounts.id, to)))
      
      const toExists = accts.some((acct) => acct.id === to)
      const hasAmount = accts.some((acct) => acct.id === from && acct.balance >= amount)
      
      if (!toExists || !hasAmount) {
        await tx.rollback()
        return
      }
      
      await tx
        .update(accounts)
        .set({ balance: sql`${accounts.balance} - ${amount}` })
        .where(eq(accounts.id, from))

      await tx
        .update(accounts)
        .set({ balance: sql`${accounts.balance} + ${amount}` })
        .where(eq(accounts.id, to))

      return await tx
        .select({ id: accounts.id, balance: accounts.balance })
        .from(accounts)
        .where(or(eq(accounts.id, from), eq(accounts.id, to)))
    })

    let res = {}

    for (const result of results) {
      if (result.id === to && conns.has(to)) {
        conns.get(to).event('balance', result, {
          requestEncoding: cenc.json,
          responseEncoding: cenc.none
        })
      } else {
        res = result
      }
    }
    return res
  })

  // logic to fund an account balance
  rpc.respond('fund', {
    requestEncoding: cenc.json,
    responseEncoding: cenc.json
  }, async ({ to, amount }) => {
    const [account] = await db.transaction(async (tx) => {
      await tx
        .update(accounts)
        .set({ balance: sql`${accounts.balance} + ${amount}` })
        .where(eq(accounts.id, to))
      return await tx
        .select({ balance: accounts.balance })
        .from(accounts)
        .where(eq(accounts.id, to))
    })
    return account
  })

  // logic to refresh a client's account balance
  rpc.respond('refresh', {
    requestEncoding: cenc.json,
    responseEncoding: cenc.json
  }, async ({ id }) => {
    const [account] = await db.transaction(async (tx) => {
      return await tx
        .select({ balance: accounts.balance })
        .from(accounts)
        .where(eq(accounts.id, id))
    })
    return account
  })
}
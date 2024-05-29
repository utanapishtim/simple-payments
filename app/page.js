'use client'
import React, { useEffect, useState, useRef } from 'react'
import b4a from 'b4a'
import FramedStream from "framed-stream"
import Protomux from "protomux"
import RPC from 'protomux-rpc'
import cenc from 'compact-encoding'
import clsx from 'clsx'
import WebSocketStream from '@/lib/websocket-stream.mjs'
import {
  ArrowDownOnSquareIcon,
  ArrowUpOnSquareIcon,
  CurrencyDollarIcon,
  ArrowPathRoundedSquareIcon
} from '@heroicons/react/24/solid'

import Modal from '@/components/modal'
import RefreshModalContents from '@/components/refresh-modal-contents'
import FundModalContents from '@/components/fund-modal-contents'
import ReceiveModalContents from '@/components/receive-modal-contents'
import SendModalContents from '@/components/send-modal-contents'

import { keyPair } from '@/app/constants'

export default function Home() {
  const [balance, setBalance] = useState(0)
  const [clipboard, setClipboard] = useState(false)
  const [error, setError] = useState(null)

  const rpc = useRef(null)

  const [ui, setUI] = useState({ 
    sending: false, 
    receiving: false, 
    funding: false, 
    refreshing: false 
  })

  function handleError (err) {
    setError(err.message)
    setTimeout(() => setError(null), 5000)
  }

  useEffect(() => {
    navigator.clipboard.readText()
      .then((text) => setClipboard(text && text === b4a.toString(keyPair.publicKey, 'hex')))
      .catch(noop)
  }, [ui.receiving])

  useEffect(() => {
    // TODO: network error handling
    const ws = new WebSocket('ws://localhost:3000/api/')
    const wss = new WebSocketStream(ws)
    const framed = new FramedStream(wss)
    const mux = Protomux.from(framed)
    const _rpc = new RPC(mux)

    rpc.current = _rpc

    _rpc.request('init', keyPair.publicKey, { 
      requestEncoding: cenc.fixed32, // how we're encoding the request, in this case as a fixed32 buffer
      responseEncoding: cenc.json    // how we're encoding the response, in this case as json
    })
      .then(({ balance }) => setBalance(balance ?? 0))
      .catch((err) => handleError(err)) // TODO: display error

    _rpc.respond('balance', { // we're setting a listener on the client
      requestEncoding: cenc.json, // we're expecting json from the server
      responseEncoding: cenc.none // we'll send nothing back in return
    }, ({ balance: nextBalance }) => setBalance(nextBalance ?? balance))
  }, [])

  const sending = toggles(ui, setUI, 'sending')
  const receiving = toggles(ui, setUI, 'receiving')
  const funding = toggles(ui, setUI, 'funding')
  const refreshing = toggles(ui, setUI, 'refreshing')

  const fund = function (amount, isFunding, setFunding) {
    return async function fund (event) {
      event.preventDefault()
      if (isFunding) return
      setFunding(true)
      const to = b4a.toString(keyPair.publicKey, 'hex')
      
      try {
        const { balance } = await rpc.current.request('fund', { to, amount }, {
          requestEncoding: cenc.json,
          responseEncoding: cenc.json
        })
        setBalance(balance)
      } catch (err) {
        handleError(err)
      } finally {
        setFunding(false)
        funding.close()
      }
    }
  }

  function send (amount, to, isSending, setIsSending) {
    return async function (event) {
      event.preventDefault()
      if (isSending) return
      setIsSending(true)
      const from = b4a.toString(keyPair.publicKey, 'hex')
      try {
        const { balance: nextBalance } = await rpc.current.request('send', { from, to, amount }, {
          requestEncoding: cenc.json,
          responseEncoding: cenc.json
        })
        setBalance(nextBalance ?? balance)
      } catch (err) {
        handleError(err)
      } finally {
        setIsSending(false)
        sending.close()
      }
    }
  }

  async function refresh (event) {
    event.preventDefault()
    const id = b4a.toString(keyPair.publicKey, 'hex')
    try {
      refreshing.open()
      await new Promise((res) => setTimeout(res, 250)) // make it look a lil slow
      const { balance: nextBalance } = await rpc.current.request('refresh', { id }, {
        requestEncoding: cenc.json,
        responseEncoding: cenc.json
      })
      setBalance(nextBalance ?? balance)
    } catch (err) {
      handleError(err)
    } finally {
      refreshing.close()
    }
  }

  return (
    <main className={clsx(
      "relative flex min-h-screen flex-col items-center justify-center bg-black text-white",
    )}>
        <div className="fixed top-0 left-0 right-0 min-w-screen">
          <div className={(error ? '' : 'hidden w-full')}>
            <p className="text-red-500 text-sm text-center p-4">{error}</p>
          </div>
        </div>
        <div className="relative w-full text-center">
          <h1 className="text-md font-semibold capitalize">balance</h1>
          <h2 className="text-5xl py-4">{balance}</h2>
          <h3 className="text-xs font-semibold capitalize">satoshi tokens</h3>
        </div>
        <div className={clsx(
          "relative mt-16 px-4 flex flex-col items-center justify-center w-full gap-4",
          "sm:gap-8"
        )}>
          <div className={clsx(
            "flex flex-row items center justify-center w-full gap-4",
            "sm:gap-8"
          )}>
            {/* sending */}
            <div 
              className={clsx(
                "border border-white/20 cursor-pointer bg-white/10 h-36 w-36 rounded-xl p-4",
                "hover:bg-white/20 hover:border-white/30"
              )} 
              onClick={sending.open}
            >
              <h1 className="font-semibold flex flex-row items-center"><ArrowUpOnSquareIcon className="rotate-45 size-4 mr-2 stroke-2"/>Send</h1>
              <Modal 
                title={<h1 className="font-semibold flex flex-row items-center"><ArrowUpOnSquareIcon className="rotate-45 size-4 mr-2 stroke-2"/>Send</h1>}
                isOpen={ui.sending}
                onClose={sending.close}
              >
                <SendModalContents close={sending.close} send={send} max={balance}/>
              </Modal>
            </div>
            {/* receiving */}
            <div 
              className={clsx(
                "relative border border-white/20 cursor-pointer bg-white/10 h-36 w-36 rounded-xl p-4",
                "hover:bg-white/20 hover:border-white/30"
              )} 
              onClick={receiving.open}
            >
              <h1 className="relative font-semibold flex flex-row items-center"><ArrowDownOnSquareIcon className="rotate-[225deg] size-4 mr-2 stroke-2"/>Receive</h1>
              <Modal 
                title={<h1 className="font-semibold flex flex-row items-center"><ArrowDownOnSquareIcon className="rotate-[225deg] size-4 mr-2 stroke-2"/>Receive</h1>}
                isOpen={ui.receiving}
                onClose={receiving.close}
              >
                <ReceiveModalContents close={receiving.close} />
              </Modal>
              <div className="absolute w-full top-0 left-0 right-0 inset-0 w-full flex flex-col items-start justify-end">
                {clipboard ? <p className="text-xs pl-4 py-3 text-green-400 font-semibold">account id copied!</p> : <></>}
              </div>
            </div>
          </div>
          <div className={clsx(
            "flex flex-row items center justify-center w-full gap-4",
            "sm:gap-8"
          )}>
            {/* fund */}
            <div 
              className={clsx(
                "border border-white/20 cursor-pointer bg-white/10 h-36 w-36 rounded-xl p-4",
                "hover:bg-white/20 hover:border-white/30"
              )} 
              onClick={funding.open}
            >             
              <h1 className="font-semibold flex flex-row items-center"><CurrencyDollarIcon className="size-4 mr-2 stroke-2"/>Fund</h1>
              <Modal 
                title={<h1 className="font-semibold flex flex-row items-center"><CurrencyDollarIcon className="size-4 mr-2 stroke-2"/>Fund</h1>}
                isOpen={ui.funding}
                onClose={funding.close}
              >
                <FundModalContents close={funding.close} fund={fund} />
              </Modal>
            </div>
            {/* refresh */}
            <div 
              className={clsx(
                "border border-white/20 cursor-pointer bg-white/10 h-36 w-36 rounded-xl p-4",
                "hover:bg-white/20 hover:border-white/30"
              )} 
              onClick={refresh}
            >             
              <h1 className="font-semibold flex flex-row items-center"><ArrowPathRoundedSquareIcon className="size-4 mr-2 stroke-2"/> Refresh</h1>
              <Modal 
                title={<h1 className="font-semibold flex flex-row items-center"><ArrowPathRoundedSquareIcon className="size-4 mr-2 stroke-2"/> Refresh</h1>}
                isOpen={ui.refreshing}
                onClose={refreshing.close}
              >
                <RefreshModalContents />
              </Modal>
            </div>
          </div>
        </div>
    </main>
  );
}

function toggles (state, set, key) {
  const open = () => set({ ...state, [key]: true })
  const close = () => set({ ...state, [key]: false }) 
  return { open, close }
}

function noop () {}

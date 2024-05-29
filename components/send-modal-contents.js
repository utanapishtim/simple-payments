import React, { useState } from 'react'
import { Description, Field, Label, Textarea, Input } from '@headlessui/react'
import clsx from 'clsx'

export default function SendModalContents ({ close, send, max }) {
  const [amount, setAmount] = useState(0)
  const [to, setTo] = useState('')
  const [isSending, setIsSending] = useState(false)

  return (
    <div>
      <div className="w-full max-w-md py-8">
      <Field>
        <Label className="text-md font-medium text-white">Recipient</Label>
        <Description className="text-xs text-white/50 mt-1">The identifier of the account you would like to send funds to.</Description>
        <Textarea
          className={clsx(
            'mt-3 block w-full resize-none rounded-lg border-none bg-white/5 py-1.5 px-3 text-sm/6 text-white',
            'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25',
            'data-invalid:outline-2 data-invalid:-outline-offset-2 data-invalid:outline-red/25'         
           )}
          rows={3}
          value={to}
          invalid={true}
          onChange={(event) => {
            event.preventDefault()
            const value = event.target.value
            setTo(value.trim())
          }}
        />
        </Field>
        <Field className="mt-6">
          <Label className="text-md font-medium text-white">Amount</Label>
          <Description className="text-xs text-white/50">The number of tokens to send to the recipient. Current balance: {max} tokens.</Description>
          <Input
            autoFocus={true}
            className={clsx(
              'my-3 block w-full rounded-lg border-none text-6xl bg-white/5 text-white h-24 text-center',
              'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
            )}
            value={amount}
            onChange={(event) => {
              event.preventDefault()
              const str = event.target.value
              const num = parseInt(str)
              if (Number.isNaN(num)) setAmount((str === '') ? 0 : amount)
              else setAmount((num > max) ? max : num)
            }}
          />
        </Field>
      </div>
      <div className="w-full flex flex-row items-center justify-between gap-4">
        <button 
          disabled={isSending} 
          className={clsx(
            'w-1/2 py-2 rounded-xl border border-black/20 font-semibold cursor-pointer',
            (!isSending) ? 'bg-green-600 hover:bg-green-500' : 'bg-green-600/50 text-white/50'
          )}
          onClick={send(amount, to, isSending, setIsSending)}
        >
          Send
        </button>
        <button 
          className={clsx(
            'w-1/2 py-2 rounded-xl border border-black/20 font-semibold cursor-pointer',
            (!isSending) ? 'bg-red-600 hover:bg-red-500' : 'bg-red-600/50 text-white/50'
          )}
          disabled={isSending}
          onClick={close}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
import React, { useState } from 'react'
import { Description, Field, Label, Input } from '@headlessui/react'
import clsx from 'clsx'

export default function FundModalContents ({ close, fund }) {
  const [amount, setAmount] = useState(0)
  const [funding, setFunding] = useState(false)

  return (
    <div>
      <div className="w-full max-w-md py-8">
        <Field>
          <Label className="text-2xl font-medium text-white">Amount</Label>
          <Description className="text-sm/6 text-white/50">Enter the number of tokens to add to your account.</Description>
          <Input
            autoFocus={true}
            className={clsx(
              'my-10 block w-full rounded-lg border-none text-6xl bg-white/5 text-white h-24 text-center',
              'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
            )}
            value={amount}
            onChange={(event) => {
              event.preventDefault()
              const str = event.target.value
              const num = parseInt(str)
              if (Number.isNaN(num)) setAmount((str === '') ? 0 : amount)
              else setAmount(num)
            }}
          />
        </Field>
      </div>
      <div className="w-full flex flex-row items-center justify-between gap-4">
        <button 
          disabled={funding} 
          className={clsx(
            'w-1/2 py-2 rounded-xl border border-black/20 font-semibold cursor-pointer',
            (!funding) ? 'bg-green-600 hover:bg-green-500' : 'bg-green-600/50 text-white/50'
          )}
          onClick={fund(amount, funding, setFunding)}
        >
          Fund
        </button>
        <button 
          className={clsx(
            'w-1/2 py-2 rounded-xl border border-black/20 font-semibold cursor-pointer',
            (!funding) ? 'bg-red-600 hover:bg-red-500' : 'bg-red-600/50 text-white/50'
          )}
          disabled={funding}
          onClick={close}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
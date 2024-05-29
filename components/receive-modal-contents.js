import React from 'react'
import { Square2StackIcon } from '@heroicons/react/24/solid'
import { Description, Field, Label, Textarea } from '@headlessui/react'
import clsx from 'clsx'
import b4a from 'b4a'

import { keyPair } from '@/app/constants'

export default function ReceiveModalContents ({ close }) {
  return (
    <div className="w-full max-w-md py-8 mb-14">
      <Field>
        <Label className="text-md font-medium text-white">Account Identifier</Label>
        <Description className="text-sm/6 text-white/50 mt-1">Share this account identifier with your counterparty to receive funds.</Description>
        <div className="flex flex-row items-center mt-3">
          <Textarea
            disabled={true}
            className={clsx(
              'block w-full resize-none rounded-l-lg border-none bg-white/5 py-1.5 px-3 text-sm/6 text-white/70',
            )}
            rows={2}
            value={b4a.toString(keyPair.publicKey, 'hex')}
          />
          <button
            className={clsx(
              'p-4 rounded-r-lg border border-white/5',
              'hover:bg-white/20 hover:border-white/30'
            )}
            onClick={() => {
              navigator.clipboard.writeText(b4a.toString(keyPair.publicKey, 'hex'))
                .then(close)
            }}
          >
            <Square2StackIcon className="size-6"/>
          </button>
        </div>
      </Field>
    </div>
  )
}
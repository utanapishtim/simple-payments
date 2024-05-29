import React from 'react'
import { ArrowPathIcon } from '@heroicons/react/24/solid'
import { Description, Field, Label } from '@headlessui/react'

export default function RefreshModalContents () {
  return (
    <div className="w-full max-w-md py-8">
      <Field>
        <Label className="text-2xl font-medium text-white">Refreshing</Label>
        <Description className="text-sm/6 text-white/50 mt-1">Syncing your balance with the ledger!</Description>
        <div className="flex flex-row items-center justify-center p-10 bg-white/5 rounded-xl mt-10">
          <ArrowPathIcon className="animate-spin size-12 strok-2" />
        </div>
      </Field>
    </div>
  )
}
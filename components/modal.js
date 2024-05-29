import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'

export default function Modal({ 
  title, 
  isOpen = false, 
  onClose,
  children
}) {
  return (
    <>
      <Transition appear show={isOpen}>
        <Dialog as="div" className="relative z-10 focus:outline-none" onClose={onClose}>
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <TransitionChild
                enter="ease-out duration-300"
                enterFrom="opacity-0 transform-[scale(95%)]"
                enterTo="opacity-100 transform-[scale(100%)]"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 transform-[scale(100%)]"
                leaveTo="opacity-0 transform-[scale(95%)]"
              >
                <DialogPanel className="p-6 w-full max-w-md min-h-2/3 bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl">
                  <DialogTitle as="div" className="text-base/7 font-medium text-white">
                    {title}
                  </DialogTitle>
                  {children}
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

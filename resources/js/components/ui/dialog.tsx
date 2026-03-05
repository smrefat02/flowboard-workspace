import * as Dialog from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';

export const DialogRoot = Dialog.Root;
export const DialogTrigger = Dialog.Trigger;
export const DialogPortal = Dialog.Portal;
export const DialogClose = Dialog.Close;

export function DialogContent({ children }: { children: ReactNode }) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-slate-900/60" />
      <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[90vh] w-[min(820px,94vw)] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-2xl bg-white p-5 shadow-2xl">
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}

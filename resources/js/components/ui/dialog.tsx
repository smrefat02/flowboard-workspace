import * as Dialog from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const DialogRoot = Dialog.Root;
export const DialogTrigger = Dialog.Trigger;
export const DialogPortal = Dialog.Portal;
export const DialogClose = Dialog.Close;

export function DialogContent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70" />
      <Dialog.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(820px,94vw)] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900 dark:text-slate-100',
          className,
        )}
      >
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}

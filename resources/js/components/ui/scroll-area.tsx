import type { HTMLAttributes } from 'react';

export function ScrollArea({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`scrollbar-thin overflow-auto ${className ?? ''}`} {...props} />;
}

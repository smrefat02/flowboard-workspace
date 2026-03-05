import type { HTMLAttributes } from 'react';

export function Command({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-lg border border-slate-200 bg-white p-2 ${className ?? ''}`} {...props} />;
}

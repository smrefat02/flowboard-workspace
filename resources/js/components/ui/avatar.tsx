import * as Avatar from '@radix-ui/react-avatar';

export function UserAvatar({ name }: { name: string }) {
  return (
    <Avatar.Root className="inline-flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-blue-100">
      <Avatar.Fallback className="text-xs font-semibold text-blue-700">
        {name.slice(0, 2).toUpperCase()}
      </Avatar.Fallback>
    </Avatar.Root>
  );
}

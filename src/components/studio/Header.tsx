import { Podcast } from 'lucide-react';

export function Header() {
  return (
    <header className="px-6 py-4 flex items-center gap-3 border-b border-border/50">
      <Podcast className="size-6 text-primary" />
      <h1 className="text-xl font-bold tracking-tight text-foreground">
        LiveCast Studio
      </h1>
    </header>
  );
}

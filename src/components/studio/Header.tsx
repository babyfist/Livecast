import { Podcast, Settings } from 'lucide-react';
import { SettingsDialog } from './SettingsDialog';

export function Header() {
  return (
    <header className="px-6 py-4 flex items-center justify-between border-b border-border/50">
      <div className="flex items-center gap-3">
        <Podcast className="size-6 text-primary" />
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          LiveCast Studio
        </h1>
      </div>
      <SettingsDialog />
    </header>
  );
}

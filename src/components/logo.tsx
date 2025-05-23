import { Package } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Package className="h-8 w-8 text-[hsl(var(--brand-color))]" />
      <h1 className="text-2xl font-bold text-[hsl(var(--brand-color))]">PackSmart AI</h1>
    </div>
  );
}

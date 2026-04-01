'use client';

import { SusuGroup } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GroupTabsProps {
  groups: SusuGroup[];
  activeGroupId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
}

export function GroupTabs({ groups, activeGroupId, onSelect, onCreate }: GroupTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 pill-scroll no-scrollbar">
      <Button
        variant="outline"
        size="sm"
        onClick={onCreate}
        className="shrink-0 rounded-full h-9 w-9 p-0 flex items-center justify-center border-dashed border-primary text-primary hover:bg-primary/10"
      >
        <Plus className="h-4 w-4" />
      </Button>
      {groups.map((group) => (
        <button
          key={group.id}
          onClick={() => onSelect(group.id)}
          className={cn(
            "shrink-0 px-5 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
            activeGroupId === group.id
              ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
              : "bg-white text-muted-foreground hover:bg-secondary border border-border"
          )}
        >
          {group.name}
        </button>
      ))}
    </div>
  );
}
'use client';

import { useState, useMemo } from 'react';
import { SusuGroup } from '@/lib/types';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, User, ArrowRight, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  groups: SusuGroup[];
  onSelectMember: (groupId: string, memberId: string) => void;
}

export function GlobalSearch({ isOpen, onClose, groups, onSelectMember }: GlobalSearchProps) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    
    const searchTerms = query.toLowerCase().split(' ');
    const items: Array<{ group: SusuGroup; member: any }> = [];

    groups.forEach(group => {
      group.members.forEach(member => {
        const matches = searchTerms.every(term => 
          member.name.toLowerCase().includes(term) || 
          group.name.toLowerCase().includes(term)
        );
        if (matches) items.push({ group, member });
      });
    });

    return items.slice(0, 10);
  }, [query, groups]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none rounded-[1.5rem] shadow-2xl">
        <DialogHeader className="p-4 bg-muted/50 border-b">
          <DialogTitle className="sr-only">Search Members</DialogTitle>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by member or group name..." 
              className="pl-10 h-10 border-none bg-transparent shadow-none focus-visible:ring-0 text-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
        </DialogHeader>

        <div className="max-h-[300px] overflow-y-auto p-2">
          {query && results.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <User className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p className="text-xs font-medium">No members found for "{query}"</p>
            </div>
          ) : (
            <div className="space-y-1">
              {results.map(({ group, member }) => (
                <button
                  key={`${group.id}-${member.id}`}
                  onClick={() => onSelectMember(group.id, member.id)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-primary/5 group transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                      {member.position}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{member.name}</h4>
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider flex items-center gap-1">
                        <Wallet className="h-2.5 w-2.5" />
                        {group.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[8px] uppercase border-primary/20 text-primary">
                      {member.daysPaid} Marks
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {!query && (
            <div className="py-8 text-center text-muted-foreground">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Start typing to search...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

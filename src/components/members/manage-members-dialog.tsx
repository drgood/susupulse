'use client';

import { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SusuGroup, Member } from '@/lib/types';
import { db } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  GripVertical,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ManageMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: SusuGroup;
  onMembersUpdate: () => void;
}

function SortableMemberItem({
  member,
  onEdit,
  onDelete,
}: {
  member: Member;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: member.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 p-3 bg-white rounded-xl border border-border',
        'transition-all shadow-sm',
        isDragging && 'opacity-50 shadow-lg scale-[1.02] z-50 bg-primary/5'
      )}
    >
      <button
        className="cursor-grab active:cursor-grabbing touch-none p-1 hover:bg-muted rounded"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-black text-primary">
        {member.position}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm truncate">{member.name}</p>
        <p className="text-[10px] text-muted-foreground">
          {member.daysPaid} marks paid
          {member.hasCashedOut && ' • Cashed out'}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onEdit(member)}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(member)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function ManageMembersDialog({
  open,
  onOpenChange,
  group,
  onMembersUpdate,
}: ManageMembersDialogProps) {
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>(
    [...group.members].sort((a, b) => a.position - b.position)
  );
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [newMemberName, setNewMemberName] = useState('');
  const [editName, setEditName] = useState('');
  const [editPosition, setEditPosition] = useState(1);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const usedPositions = useMemo(() => {
    return new Set(members.map((m) => m.position));
  }, [members]);

  const firstAvailablePosition = useMemo(() => {
    let pos = 1;
    while (usedPositions.has(pos)) {
      pos++;
    }
    return pos;
  }, [usedPositions]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setMembers((items) => {
        const oldIndex = items.findIndex((m) => m.id === active.id);
        const newIndex = items.findIndex((m) => m.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        const updatedMembers = newItems.map((m, idx) => ({
          ...m,
          position: idx + 1,
        }));

        saveMembers(updatedMembers);
        return updatedMembers;
      });
    }
  };

  const saveMembers = async (updatedMembers: Member[]) => {
    await db.groups.update(group.id, { members: updatedMembers });
    onMembersUpdate();
  };

  const handleAddMember = async () => {
    if (!newMemberName.trim()) {
      toast({ title: 'Error', description: 'Please enter a name', variant: 'destructive' });
      return;
    }

    const newMember: Member = {
      id: crypto.randomUUID(),
      name: newMemberName.trim(),
      position: firstAvailablePosition,
      daysPaid: 0,
      creditRemainder: 0,
      hasCashedOut: false,
      joinDate: new Date().toISOString(),
    };

    const updatedMembers = [...members, newMember].sort((a, b) => a.position - b.position);
    await saveMembers(updatedMembers);
    setMembers(updatedMembers);
    setNewMemberName('');
    setIsAddOpen(false);
    toast({ title: 'Member Added', description: `${newMember.name} added at position ${firstAvailablePosition}` });
  };

  const openEditDialog = (member: Member) => {
    setSelectedMember(member);
    setEditName(member.name);
    setEditPosition(member.position);
    setIsEditOpen(true);
  };

  const handleEditMember = async () => {
    if (!selectedMember || !editName.trim()) return;

    const targetPosition = editPosition;
    if (targetPosition < 1 || targetPosition > members.length) {
      toast({ title: 'Error', description: 'Invalid position', variant: 'destructive' });
      return;
    }

    let updatedMembers: Member[];

    if (targetPosition !== selectedMember.position) {
      updatedMembers = members.map((m) => {
        if (m.id === selectedMember.id) {
          return { ...m, name: editName.trim(), position: targetPosition };
        }
        if (m.position === targetPosition) {
          return { ...m, position: selectedMember.position };
        }
        return m;
      });
    } else {
      updatedMembers = members.map((m) =>
        m.id === selectedMember.id ? { ...m, name: editName.trim() } : m
      );
    }

    updatedMembers.sort((a, b) => a.position - b.position);
    await saveMembers(updatedMembers);
    setMembers(updatedMembers);
    setIsEditOpen(false);
    setSelectedMember(null);
    toast({ title: 'Member Updated', description: 'Changes saved successfully' });
  };

  const openDeleteDialog = (member: Member) => {
    setSelectedMember(member);
    setIsDeleteOpen(true);
  };

  const handleDeleteMember = async () => {
    if (!selectedMember) return;

    const updatedMembers = members
      .filter((m) => m.id !== selectedMember.id)
      .sort((a, b) => a.position - b.position);

    await saveMembers(updatedMembers);
    setMembers(updatedMembers);
    setIsDeleteOpen(false);
    setSelectedMember(null);
    toast({
      title: 'Member Removed',
      description: `${selectedMember.name} has been removed. Their position is now available.`,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-hidden flex flex-col rounded-2xl p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Manage Members
            </DialogTitle>
            <DialogDescription>
              Drag to reorder • {members.length} member{members.length !== 1 && 's'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {members.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No members yet</p>
                <p className="text-xs">Add your first member below</p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={members.map((m) => m.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {members.map((member) => (
                      <SortableMemberItem
                        key={member.id}
                        member={member}
                        onEdit={openEditDialog}
                        onDelete={openDeleteDialog}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          <div className="p-6 pt-0">
            {isAddOpen ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Enter member name"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                  className="flex-1 h-12 rounded-xl"
                  autoFocus
                />
                <Button
                  onClick={handleAddMember}
                  className="h-12 px-4 rounded-xl"
                  disabled={!newMemberName.trim()}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddOpen(false);
                    setNewMemberName('');
                  }}
                  className="h-12 px-4 rounded-xl"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsAddOpen(true)}
                className="w-full h-12 rounded-xl"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Member (Position {firstAvailablePosition})
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
            <DialogDescription>
              Change name or swap positions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-10 rounded-lg"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Position</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-lg"
                  onClick={() => setEditPosition((p) => Math.max(1, p - 1))}
                  disabled={editPosition <= 1}
                >
                  <span className="sr-only">Decrease</span>—
                </Button>
                <div className="flex-1 text-center font-bold text-lg">
                  {editPosition}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-lg"
                  onClick={() => setEditPosition((p) => Math.min(members.length, p + 1))}
                  disabled={editPosition >= members.length}
                >
                  <span className="sr-only">Increase</span>+
                </Button>
              </div>
              {selectedMember && editPosition !== selectedMember.position && (
                <p className="text-xs text-muted-foreground text-center">
                  Position {editPosition} will be swapped with{' '}
                  {members.find((m) => m.position === editPosition)?.name}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} className="rounded-lg">
              Cancel
            </Button>
            <Button onClick={handleEditMember} className="rounded-lg" disabled={!editName.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{selectedMember?.name}</strong> from this
              group? Their position will remain available for future members.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg"
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

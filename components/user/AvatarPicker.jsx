import { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UserAvatar } from '@/components/user/UserAvatar';
import { PREDEFINED_AVATARS } from '@/lib/userDisplay';

export function AvatarPicker({
  open,
  onOpenChange,
  selectedAvatarKey,
  onSelect,
  user,
}) {
  const [localValue, setLocalValue] = useState(selectedAvatarKey || null);

  const options = useMemo(
    () => [null, ...PREDEFINED_AVATARS],
    []
  );

  const handleSave = () => {
    onSelect(localValue);
    onOpenChange(false);
  };

  const handleOpenChange = (nextOpen) => {
    if (nextOpen) {
      setLocalValue(selectedAvatarKey || null);
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Elegí tu avatar</DialogTitle>
          <DialogDescription>
            Podés usar avatares predefinidos o dejar solo tus iniciales.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {options.map((optionKey, index) => {
            const isSelected = localValue === optionKey;
            const label = optionKey ? optionKey.replace('-', ' ') : 'Usar iniciales';
            const previewUser = {
              ...user,
              avatar_key: optionKey,
            };

            return (
              <button
                key={optionKey || `none-${index}`}
                type="button"
                onClick={() => setLocalValue(optionKey)}
                className={`rounded-lg border p-3 transition text-left ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-300 bg-blue-50'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <UserAvatar
                    user={previewUser}
                    avatarKey={optionKey}
                    size="lg"
                    showIconFallback={!optionKey}
                    fallbackClassName={!optionKey ? 'bg-amber-100 text-amber-700' : ''}
                  />
                  {isSelected ? <Check className="h-4 w-4 text-blue-600" /> : null}
                </div>
                <p className="mt-2 text-sm font-medium text-slate-700 capitalize">{label}</p>
              </button>
            );
          })}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Guardar avatar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

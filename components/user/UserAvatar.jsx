import { useEffect, useMemo, useState } from 'react';
import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatarSrcByKey, getUserInitials } from '@/lib/userDisplay';

const sizeClasses = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-24 w-24 text-2xl',
};

export function UserAvatar({
  user,
  avatarKey,
  size = 'md',
  className = '',
  fallbackClassName = '',
  showIconFallback = false,
}) {
  const [imageError, setImageError] = useState(false);

  const resolvedAvatarKey = avatarKey ?? user?.avatar_key ?? null;
  const avatarSrc = useMemo(() => getAvatarSrcByKey(resolvedAvatarKey), [resolvedAvatarKey]);
  const initials = getUserInitials(user);
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  useEffect(() => {
    setImageError(false);
  }, [avatarSrc]);

  const useImage = Boolean(avatarSrc) && !imageError;

  return (
    <Avatar className={`${sizeClass} border border-border ${className}`}>
      {useImage ? (
        <AvatarImage
          src={avatarSrc}
          alt={`Avatar de ${user?.nombre || user?.usuario || 'usuario'}`}
          onError={() => setImageError(true)}
        />
      ) : null}
      <AvatarFallback className={`bg-muted text-foreground font-semibold ${fallbackClassName}`}>
        {showIconFallback && initials === 'U' ? <User className="h-4 w-4" /> : initials}
      </AvatarFallback>
    </Avatar>
  );
}

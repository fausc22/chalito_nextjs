export const PREDEFINED_AVATARS = [
  'avatar-1',
  'avatar-2',
  'avatar-3',
  'avatar-4',
  'avatar-5',
  'avatar-6',
];

export const getUserInitials = (user) => {
  const source = user?.nombre || user?.usuario || user?.email || 'U';
  const clean = String(source).trim();
  if (!clean) return 'U';

  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return clean.slice(0, 2).toUpperCase();
};

export const getUserSecondaryText = (user) => {
  if (user?.email) return user.email;
  if (user?.usuario) return `@${user.usuario}`;
  return '';
};

export const getAvatarSrcByKey = (avatarKey) => {
  if (!avatarKey) return null;
  return `/avatars/${avatarKey}.png`;
};

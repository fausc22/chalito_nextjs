import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useThemeMode } from '@/contexts/ThemeContext';

const OPTIONS = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Oscuro', icon: Moon },
  { value: 'system', label: 'Sistema', icon: Monitor },
];

function ActiveIcon({ preference, isDark, className }) {
  if (preference === 'system') {
    return <Monitor className={className} />;
  }
  if (isDark) {
    return <Moon className={className} />;
  }
  return <Sun className={className} />;
}

export function ThemeToggle({ className = '' }) {
  const { preference, isDark, setThemePreference } = useThemeMode();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={`h-10 w-10 shrink-0 ${className}`}
        aria-hidden
        disabled
      />
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={`h-10 w-10 shrink-0 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground ${className}`}
          aria-label="Elegir tema de la interfaz"
          title="Tema: claro, oscuro o sistema"
        >
          <ActiveIcon preference={preference} isDark={isDark} className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        {OPTIONS.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setThemePreference(value)}
            className={preference === value ? 'bg-accent font-medium' : ''}
          >
            <Icon className="mr-2 h-4 w-4" />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

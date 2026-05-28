import { useRouter } from 'next/router';
import { ShoppingBasket } from 'lucide-react';
import { ROUTES } from '@/config/routes';
import { MODULES, canWrite } from '@/config/permissions';
import { Button } from '@/components/ui/button';

export function HomePrimaryAction({ userRole }) {
  const router = useRouter();

  if (!canWrite(userRole, MODULES.PEDIDOS)) {
    return null;
  }

  return (
    <div>
      <Button
        type="button"
        size="lg"
        className="gap-2 bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
        onClick={() => router.push(ROUTES.PEDIDOS)}
      >
        <ShoppingBasket className="h-5 w-5" />
        Ir a pedidos
      </Button>
    </div>
  );
}

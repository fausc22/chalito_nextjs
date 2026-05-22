import Link from 'next/link';
import { ShoppingBasket } from 'lucide-react';
import { ROUTES } from '@/config/routes';
import { MODULES, canWrite } from '@/config/permissions';
import { Button } from '@/components/ui/button';

export function HomePrimaryAction({ userRole }) {
  if (!canWrite(userRole, MODULES.PEDIDOS)) {
    return null;
  }

  return (
    <div>
      <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
        <Link href={ROUTES.PEDIDOS}>
          <ShoppingBasket className="mr-2 h-5 w-5" />
          Ir a pedidos
        </Link>
      </Button>
    </div>
  );
}

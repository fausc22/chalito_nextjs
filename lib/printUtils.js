/**
 * Impresión por navegador (fallback) — delega a PrintPayload v1 / 58mm
 */
import {
  printKitchenPayloadBrowser,
  printCustomerPayloadBrowser,
  printPayloadBrowser
} from './printUtilsBrowser';

export { printPayloadBrowser, printKitchenPayloadBrowser, printCustomerPayloadBrowser };

/** @deprecated Use printKitchenPayloadBrowser with PrintPayload v1 */
export const imprimirComanda = (datos) => {
  if (datos?.kind === 'kitchen' || datos?.version === 1) {
    return printKitchenPayloadBrowser(datos);
  }
  return printKitchenPayloadBrowser(datos);
};

/** @deprecated Use printCustomerPayloadBrowser with PrintPayload v1 */
export const imprimirTicket = (datos) => {
  if (datos?.kind === 'customer' || datos?.version === 1) {
    return printCustomerPayloadBrowser(datos);
  }
  return printCustomerPayloadBrowser(datos);
};

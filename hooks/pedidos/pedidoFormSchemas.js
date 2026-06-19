import { z } from 'zod';

export const SOLO_LETRAS_ESPACIOS = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-']*$/;
export const SOLO_NUMEROS_TELEFONO = /^\+?[\d\s\-()]*$/;
export const DIRECCION_SEGURA = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,\-'/°]*$/;
export const NUMERO_ALTURA = /^[a-zA-Z0-9\s\-°]*$/;

export const clienteSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo')
    .regex(SOLO_LETRAS_ESPACIOS, 'El nombre solo puede contener letras, espacios, guiones o apóstrofes'),
  telefono: z.preprocess(
    (val) => {
      if (!val || (typeof val === 'string' && val.trim() === '')) {
        return undefined;
      }
      return val;
    },
    z
      .string()
      .max(20, 'El teléfono es demasiado largo')
      .regex(SOLO_NUMEROS_TELEFONO, 'El teléfono solo puede contener números, espacios, guiones o paréntesis')
      .refine((v) => v.replace(/\D/g, '').length >= 6, 'El teléfono debe tener al menos 6 dígitos')
      .optional()
  ),
  email: z.preprocess(
    (val) => {
      if (!val || (typeof val === 'string' && val.trim() === '')) {
        return undefined;
      }
      return val;
    },
    z.string().email('Email inválido').optional()
  ),
  direccion: z
    .object({
      calle: z.string().max(200).regex(DIRECCION_SEGURA, 'Caracteres no permitidos en calle').optional().or(z.literal('')),
      numero: z.string().max(30).regex(NUMERO_ALTURA, 'Caracteres no permitidos en número').optional().or(z.literal('')),
      entreCalles: z.string().max(80).regex(DIRECCION_SEGURA, 'Caracteres no permitidos').optional().or(z.literal('')),
      edificio: z.string().max(100).regex(DIRECCION_SEGURA, 'Caracteres no permitidos').optional().or(z.literal('')),
      piso: z.string().max(50).regex(DIRECCION_SEGURA, 'Caracteres no permitidos').optional().or(z.literal('')),
      observaciones: z.string().max(300).regex(DIRECCION_SEGURA, 'Caracteres no permitidos').optional().or(z.literal('')),
    })
    .optional(),
});

export const carritoSchema = z
  .array(
    z.object({
      id: z.number().or(z.string()),
      nombre: z.string(),
      precio: z.number().min(0),
      cantidad: z.number().int().min(1),
      extrasSeleccionados: z.array(z.any()).optional(),
      observacion: z.string().optional().nullable(),
    })
  )
  .min(1, 'Debe agregar al menos un producto al carrito');

export const pedidoSchema = z.object({
  cliente: clienteSchema,
  carrito: carritoSchema,
  tipoEntrega: z.enum(['delivery', 'retiro']),
  origen: z.string().min(1),
  tipoPedido: z.string().min(1),
  horaProgramada: z.string().optional().nullable(),
  medioPago: z.string().optional(),
  estadoPago: z.string(),
});

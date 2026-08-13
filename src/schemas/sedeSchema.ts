import { z } from 'zod';

export const sedeSchema = z.object({
    nombre: z.string().min(2, 'Nombre muy corto'),
    direccion: z.string().min(5, 'Dirección requerida'),
    capacidadMaxima: z.coerce.number().min(1, 'Capacidad mínima es 1')
});

export type SedeSchemaType = z.infer<typeof sedeSchema>;

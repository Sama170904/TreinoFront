import { z } from 'zod';

export const claseSchema = z.object({
    sedeId: z.coerce.number().min(1, 'Sede requerida'),
    disciplina: z.string().min(2, 'Disciplina requerida'),
    descripcion: z.string().optional().or(z.literal('')),
    fechaHoraInicio: z.string().min(1, 'Fecha y hora de inicio requeridas'),
    fechaHoraFin: z.string().min(1, 'Fecha y hora de fin requeridas'),
    cupoMaximo: z.coerce.number().min(1, 'Cupo mínimo es 1')
});

export type ClaseSchemaType = z.infer<typeof claseSchema>;

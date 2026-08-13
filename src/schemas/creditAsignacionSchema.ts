import { z } from 'zod';

export const creditAsignacionSchema = z.object({
    clienteId: z.number().min(1, 'ID de cliente requerido'),
    cantidad: z.number().min(1, 'Debes asignar al menos 1 crédito'),
    vigenciaTipo: z.enum(['SEMANAL', 'MENSUAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL'], {
        errorMap: () => ({ message: 'Tipo de vigencia inválido' })
    })
});

export type CreditAsignacionSchemaType = z.infer<typeof creditAsignacionSchema>;
export type CreditAsignacionFormData = CreditAsignacionSchemaType;

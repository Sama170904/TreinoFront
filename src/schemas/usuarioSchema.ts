import { z } from 'zod';

export const usuarioSchema = z.object({
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
    email: z.string().email('Ingresa un correo electrónico válido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    rol: z.enum(['ADMINISTRADOR', 'PROFESOR', 'CLIENTE'], {
        errorMap: () => ({ message: 'Selecciona un rol válido' })
    })
});

export type UsuarioSchemaType = z.infer<typeof usuarioSchema>;

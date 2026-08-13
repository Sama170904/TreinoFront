import { test, expect, request } from '@playwright/test';
import { API_BASE_URL, loginViaApi } from '../helpers/api.helper';

test.describe('Suite Especial de Concurrencia (Race Condition & Lock Pesimista)', () => {
  test('Prueba de Concurrencia Extrema: 2 usuarios diferentes disparan simultáneamente la reserva del ÚLTIMO cupo disponible (Cupo Máximo = 1)', async () => {
    // 1. Iniciar sesión como ADMINISTRADOR
    const tokenAdmin = await loginViaApi('admin@treino.com', 'admin123');
    const adminReq = await request.newContext({
      extraHTTPHeaders: { Authorization: `Bearer ${tokenAdmin}` }
    });

    const timestamp = Date.now();
    const emailUser1 = `clienterace1_${timestamp}@treino.com`;
    const emailUser2 = `clienterace2_${timestamp}@treino.com`;
    const passwordUser = 'cliente123';

    // 2. Crear 2 nuevos clientes de prueba aislados
    const user1CreateRes = await adminReq.post(`${API_BASE_URL}/usuarios`, {
      data: { nombre: 'ClienteConcurrente1', apellido: 'Test', email: emailUser1, password: passwordUser, rol: 'CLIENTE' }
    });
    expect(user1CreateRes.status()).toBe(200);
    const user1Data = (await user1CreateRes.json()).data;

    const user2CreateRes = await adminReq.post(`${API_BASE_URL}/usuarios`, {
      data: { nombre: 'ClienteConcurrente2', apellido: 'Test', email: emailUser2, password: passwordUser, rol: 'CLIENTE' }
    });
    expect(user2CreateRes.status()).toBe(200);
    const user2Data = (await user2CreateRes.json()).data;

    // 3. Asignar 1 crédito activo a cada cliente
    await adminReq.post(`${API_BASE_URL}/creditos/asignar`, {
      data: { clienteId: user1Data.userId, cantidad: 1, vigenciaTipo: 'SEMANAL' }
    });
    await adminReq.post(`${API_BASE_URL}/creditos/asignar`, {
      data: { clienteId: user2Data.userId, cantidad: 1, vigenciaTipo: 'SEMANAL' }
    });

    // 4. Crear una clase con EXACTAMENTE 1 CUPO MÁXIMO
    const now = new Date();
    const startTime = new Date(now.getTime() + 86400000).toISOString().slice(0, 16);
    const endTime = new Date(now.getTime() + 90000000).toISOString().slice(0, 16);

    const createClassRes = await adminReq.post(`${API_BASE_URL}/clases`, {
      data: {
        sedeId: 1,
        disciplina: `Pilates Concurrencia ${timestamp}`,
        descripcion: 'Test de concurrencia de bloqueo pesimista',
        fechaHoraInicio: startTime,
        fechaHoraFin: endTime,
        cupoMaximo: 1
      }
    });

    expect(createClassRes.status()).toBe(200);
    const claseId = (await createClassRes.json()).data.claseId;

    // 5. Autenticar a los 2 clientes y preparar contextos HTTP
    const tokenUser1 = await loginViaApi(emailUser1, passwordUser);
    const tokenUser2 = await loginViaApi(emailUser2, passwordUser);

    const reqUser1 = await request.newContext({
      extraHTTPHeaders: { Authorization: `Bearer ${tokenUser1}` }
    });

    const reqUser2 = await request.newContext({
      extraHTTPHeaders: { Authorization: `Bearer ${tokenUser2}` }
    });

    // 6. DISPARO SIMULTÁNEO (RACE CONDITION EN EL MISMO MILISEGUNDO)
    console.log(`\n🚀 Disparando 2 reservas simultáneas para la Clase ID ${claseId} (Cupo Máximo = 1)...`);
    const [resUser1, resUser2] = await Promise.all([
      reqUser1.post(`${API_BASE_URL}/reservas`, { data: { claseId } }),
      reqUser2.post(`${API_BASE_URL}/reservas`, { data: { claseId } })
    ]);

    const status1 = resUser1.status();
    const status2 = resUser2.status();

    console.log(`📊 RESULTADO HTTP DE CONCURRENCIA:`);
    console.log(`   - Cliente 1 status: ${status1}`);
    console.log(`   - Cliente 2 status: ${status2}`);

    // 7. ASERCIÓN 1: EXACTAMENTE UNA PETICIÓN LOGRA HTTP 200 Y EXACTAMENTE UNA ES RECHAZADA CON HTTP 400
    const statuses = [status1, status2].sort();
    expect(statuses).toEqual([200, 400]);

    // 8. ASERCIÓN 2: El mensaje de error devuelto a la petición rechazada indica falta de cupo
    const failedRes = status1 === 400 ? resUser1 : resUser2;
    const failedBody = await failedRes.json();
    console.log(`   - Mensaje devuelto al cliente rechazado: "${failedBody.message}"`);
    expect(failedBody.message).toMatch(/cupo|lleno|tomado/i);

    // 9. ASERCIÓN 3: Integridad en Base de Datos (cuposReservados NUNCA sobrepasa 1)
    const getClaseRes = await adminReq.get(`${API_BASE_URL}/clases`);
    const clases = (await getClaseRes.json()).data;
    const claseFinal = clases.find((c: any) => c.claseId === claseId);

    expect(claseFinal).toBeDefined();
    expect(claseFinal.cuposReservados).toBe(1);
    expect(claseFinal.cupoMaximo).toBe(1);
    console.log(`✅ VERIFICADO: El bloqueo pesimista en PostgreSQL evitó la sobre-reserva. Cupos reservados finales: ${claseFinal.cuposReservados}/${claseFinal.cupoMaximo}\n`);
  });
});

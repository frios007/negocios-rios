import { db } from './db';
import {
  clinicalRecords,
  patients,
  hospitalizations,
  hospitalizationNotes,
  hospitalizationItems,
} from '../schemas/clinical';

export async function seedClinical(coreData: any, salesData: any) {
  const { veterinaria } = coreData.businessUnits;
  const { owner } = coreData.users;
  const { donaMariaVet, carlosPVet, anaRiveraVet } = salesData.clients;

  console.log('🐕 Ingresando Pacientes (Mascotas)...');
  const [perroMax, gatoMimi, conejoLuna, perroRocky, gataLuna] = await db
    .insert(patients)
    .values([
      {
        name: 'Max',
        species: 'Perro',
        breed: 'Golden Retriever',
        sex: 'Macho',
        color: 'Dorado',
        clientId: donaMariaVet.id,
        businessUnitId: veterinaria.id,
      },
      {
        name: 'Mimi',
        species: 'Gato',
        breed: 'Siamés',
        sex: 'Hembra',
        color: 'Blanco con marrón',
        clientId: donaMariaVet.id,
        businessUnitId: veterinaria.id,
      },
      {
        name: 'Luna',
        species: 'Conejo',
        breed: 'Holland Lop',
        sex: 'Hembra',
        color: 'Gris',
        clientId: donaMariaVet.id,
        businessUnitId: veterinaria.id,
      },
      {
        name: 'Rocky',
        species: 'Perro',
        breed: 'Rottweiler',
        sex: 'Macho',
        color: 'Negro con marrón',
        clientId: carlosPVet.id,
        businessUnitId: veterinaria.id,
      },
      {
        name: 'Luna',
        species: 'Gato',
        breed: 'Persa',
        sex: 'Hembra',
        color: 'Blanco',
        clientId: anaRiveraVet.id,
        businessUnitId: veterinaria.id,
      },
    ])
    .returning({ id: patients.id });

  console.log('🩺 Registrando Historial Clínico...');
  await db.insert(clinicalRecords).values([
    {
      patientId: perroMax.id,
      vetId: owner.id,
      weight: '15.50',
      temperature: '38.5',
      reason: 'Decaído y control de vacunas',
      diagnosis: 'Ligera deshidratación, paciente estable. Se aplica vacuna múltiple.',
      prescription: 'Suero oral en casa por 2 días.',
      internalNotes: 'Doña María pide descuentos a menudo, manejar con cuidado.',
      status: 'DISCHARGED',
      businessUnitId: veterinaria.id,
    },
    {
      patientId: gatoMimi.id,
      vetId: owner.id,
      weight: '4.20',
      temperature: '39.0',
      reason: 'Esterilización programada',
      diagnosis: 'Paciente apta para cirugía.',
      prescription: 'Antibiótico post-operatorio por 5 días.',
      status: 'DISCHARGED',
      businessUnitId: veterinaria.id,
    },
    {
      patientId: conejoLuna.id,
      vetId: owner.id,
      weight: '1.80',
      temperature: '39.5',
      reason: 'Consulta de rutina',
      diagnosis: 'Paciente saludable.',
      status: 'CONSULTATION',
      businessUnitId: veterinaria.id,
    },
    {
      patientId: perroRocky.id,
      vetId: owner.id,
      weight: '38.00',
      temperature: '38.8',
      reason: 'Vacunación antirrábica',
      diagnosis: 'Paciente en buen estado.',
      prescription: 'Ninguna. Próxima vacuna en 1 año.',
      status: 'DISCHARGED',
      businessUnitId: veterinaria.id,
    },
    {
      patientId: gataLuna.id,
      vetId: owner.id,
      weight: '3.50',
      temperature: '38.3',
      reason: 'Desparasitación y control',
      diagnosis: 'Se aplica desparasitante interno.',
      prescription: 'Repetir en 3 meses.',
      status: 'DISCHARGED',
      businessUnitId: veterinaria.id,
    },
  ]);

  console.log('🏥 Registrando Hospitalizaciones...');
  // Discharged hospitalization
  await db.insert(hospitalizations).values([
    {
      patientId: gatoMimi.id,
      vetId: owner.id,
      reason: 'Recuperación post-esterilización',
      diagnosis: 'Observación post-quirúrgica de rutina.',
      estimatedDays: 2,
      dailyRate: '150.00',
      status: 'DISCHARGED',
      dischargedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      dischargeNotes: 'Paciente se recuperó bien. Lista para ir a casa.',
      businessUnitId: veterinaria.id,
    },
  ]);

  // Active hospitalization with notes and items
  const [activeHosp] = await db
    .insert(hospitalizations)
    .values([
      {
        patientId: perroMax.id,
        vetId: owner.id,
        reason: 'Intoxicación por alimento en mal estado',
        diagnosis: 'Gastroenteritis aguda. Requiere hidratación IV.',
        estimatedDays: 4,
        dailyRate: '200.00',
        status: 'ACTIVE',
        businessUnitId: veterinaria.id,
      },
    ])
    .returning({ id: hospitalizations.id });

  await db.insert(hospitalizationNotes).values([
    {
      hospitalizationId: activeHosp.id,
      vetId: owner.id,
      weight: '14.80',
      temperature: '39.2',
      observations: 'Paciente llegó con vómitos frecuentes. Se inicia suero IV.',
      treatment: 'Suero Ringer Lactato 500ml IV. Metoclopramida 0.5mg/kg.',
    },
    {
      hospitalizationId: activeHosp.id,
      vetId: owner.id,
      weight: '14.90',
      temperature: '38.8',
      observations: 'Mejoría notable. Dejó de vomitar. Acepta agua.',
      treatment: 'Continúa suero. Dieta blanda iniciada.',
    },
  ]);

  await db.insert(hospitalizationItems).values([
    {
      hospitalizationId: activeHosp.id,
      description: 'Suero Ringer Lactato 500ml',
      quantity: 2,
      unitPrice: '45.00',
    },
    {
      hospitalizationId: activeHosp.id,
      description: 'Metoclopramida inyección',
      quantity: 3,
      unitPrice: '25.00',
    },
  ]);

  return {
    patients: { perroMax, gatoMimi, conejoLuna, perroRocky, gataLuna },
  };
}

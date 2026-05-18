import * as bcrypt from 'bcryptjs';
import dataSource from './data-source';
import { Article } from '../articles/article.entity';
import { ArticleType } from '../articles/enums/article-type.enum';
import { EtaRole } from '../common/enums/eta-role.enum';
import { Client } from '../clients/client.entity';
import { Employee } from '../employees/employee.entity';
import { EtaUser } from '../eta-users/eta-user.entity';
import { Eta } from '../etas/eta.entity';
import { Material } from '../materials/material.entity';
import { TariffCategory } from '../tariffs/tariff-category.entity';
import { Tariff } from '../tariffs/tariff.entity';
import { Unit } from '../units/unit.entity';
import { User } from '../users/user.entity';

const ids = {
  eta: '00000000-0000-0000-0000-000000000001',
  adminUser: '00000000-0000-0000-0000-000000000010',
  employeeUser: '00000000-0000-4000-8000-000000000011',
  adminMembership: '00000000-0000-0000-0000-000000000020',
  employeeMembership: '00000000-0000-4000-8000-000000000021',
  client: '00000000-0000-4000-8000-000000000100',
  employee: '00000000-0000-4000-8000-000000000110',
  materialTractor: '00000000-0000-4000-8000-000000000120',
  materialTrailer: '00000000-0000-4000-8000-000000000121',
  articleLabor: '00000000-0000-4000-8000-000000000130',
  articleTravel: '00000000-0000-4000-8000-000000000131',
  articleMaintenance: '00000000-0000-4000-8000-000000000132',
  articleFuel: '00000000-0000-4000-8000-000000000133',
  unitHour: '00000000-0000-4000-8000-000000000140',
  unitKm: '00000000-0000-4000-8000-000000000141',
  unitLiter: '00000000-0000-4000-8000-000000000142',
  tariffCategory: '00000000-0000-4000-8000-000000000150',
  laborTariff: '00000000-0000-4000-8000-000000000160',
  travelTariff: '00000000-0000-4000-8000-000000000161',
  fuelTariff: '00000000-0000-4000-8000-000000000162',
};

function getSeedPassword(): string {
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!';

  if (process.env.NODE_ENV === 'production' && password === 'ChangeMe123!') {
    throw new Error(
      'SEED_ADMIN_PASSWORD must be set to a strong value in production.',
    );
  }

  return password;
}

async function runSeed(): Promise<void> {
  await dataSource.initialize();

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@eta.local';
  const adminPasswordHash = await bcrypt.hash(getSeedPassword(), saltRounds);
  const employeePasswordHash = await bcrypt.hash(
    process.env.SEED_EMPLOYEE_PASSWORD ?? getSeedPassword(),
    saltRounds,
  );

  await dataSource.getRepository(Eta).save({
    id: ids.eta,
    name: 'ETA Demo',
    slug: 'eta-demo',
    isActive: true,
  });

  await dataSource.getRepository(User).save([
    {
      id: ids.adminUser,
      email: adminEmail.toLowerCase(),
      passwordHash: adminPasswordHash,
      firstName: 'Admin',
      lastName: 'ETA',
      isActive: true,
    },
    {
      id: ids.employeeUser,
      email: 'employee@eta.local',
      passwordHash: employeePasswordHash,
      firstName: 'Jean',
      lastName: 'Dupont',
      isActive: true,
    },
  ]);

  await dataSource.getRepository(EtaUser).save([
    {
      id: ids.adminMembership,
      etaId: ids.eta,
      userId: ids.adminUser,
      role: EtaRole.OWNER,
      isActive: true,
    },
    {
      id: ids.employeeMembership,
      etaId: ids.eta,
      userId: ids.employeeUser,
      role: EtaRole.EMPLOYEE,
      isActive: true,
    },
  ]);

  await dataSource.getRepository(Client).save({
    id: ids.client,
    etaId: ids.eta,
    code: 'CL-001',
    displayName: 'Ferme Martin',
    contactName: 'Paul Martin',
    email: 'paul.martin@example.test',
    phone: '+33102030405',
    notes: 'Client de demonstration.',
    isActive: true,
  });

  await dataSource.getRepository(Employee).save({
    id: ids.employee,
    etaId: ids.eta,
    userId: ids.employeeUser,
    code: 'SAL-001',
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'employee@eta.local',
    phone: '+33102030406',
    dailyMinutes: 420,
    isActive: true,
  });

  await dataSource.getRepository(Material).save([
    {
      id: ids.materialTractor,
      etaId: ids.eta,
      code: 'MAT-001',
      name: 'Tracteur 150 CV',
      registrationNumber: 'AB-123-CD',
      analyticCode: 'AN-MAT-001',
      isActive: true,
    },
    {
      id: ids.materialTrailer,
      etaId: ids.eta,
      code: 'MAT-002',
      name: 'Benne agricole',
      registrationNumber: null,
      analyticCode: 'AN-MAT-002',
      isActive: true,
    },
  ]);

  await dataSource.getRepository(Article).save([
    {
      id: ids.articleLabor,
      etaId: ids.eta,
      code: 'MO',
      name: 'Main oeuvre',
      type: ArticleType.BILLABLE,
      isActive: true,
    },
    {
      id: ids.articleTravel,
      etaId: ids.eta,
      code: 'DEP',
      name: 'Deplacement',
      type: ArticleType.TRAVEL,
      isActive: true,
    },
    {
      id: ids.articleMaintenance,
      etaId: ids.eta,
      code: 'ENT',
      name: 'Entretien materiel',
      type: ArticleType.MAINTENANCE,
      isActive: true,
    },
    {
      id: ids.articleFuel,
      etaId: ids.eta,
      code: 'GNR',
      name: 'Carburant GNR',
      type: ArticleType.CONSUMABLE,
      isActive: true,
    },
  ]);

  const unitRepository = dataSource.getRepository(Unit);
  const seedUnits = [
    {
      id: ids.unitHour,
      etaId: ids.eta,
      code: 'H',
      label: 'Heure',
      isActive: true,
    },
    {
      id: ids.unitKm,
      etaId: ids.eta,
      code: 'KM',
      label: 'Kilometre',
      isActive: true,
    },
    {
      id: ids.unitLiter,
      etaId: ids.eta,
      code: 'L',
      label: 'Litre',
      isActive: true,
    },
  ];

  await unitRepository
    .createQueryBuilder()
    .insert()
    .into(Unit)
    .values(seedUnits)
    .orUpdate(['label', 'isActive'], ['etaId', 'code'])
    .execute();

  const persistedUnits = await unitRepository
    .createQueryBuilder('unit')
    .where('unit.etaId = :etaId', { etaId: ids.eta })
    .andWhere('unit.code IN (:...codes)', {
      codes: seedUnits.map((unit) => unit.code),
    })
    .getMany();

  const unitIdsByCode = new Map(
    persistedUnits.map((unit) => [unit.code, unit.id]),
  );

  const getUnitId = (code: string): string => {
    const unitId = unitIdsByCode.get(code);

    if (!unitId) {
      throw new Error(`Seed unit ${code} was not found after upsert.`);
    }

    return unitId;
  };

  await dataSource.getRepository(TariffCategory).save({
    id: ids.tariffCategory,
    etaId: ids.eta,
    name: 'Tarifs standards',
    isActive: true,
  });

  await dataSource.getRepository(Tariff).save([
    {
      id: ids.laborTariff,
      etaId: ids.eta,
      articleId: ids.articleLabor,
      unitId: getUnitId('H'),
      categoryId: ids.tariffCategory,
      label: 'Main oeuvre horaire',
      unitPrice: 65,
      validFrom: '2026-01-01',
      validTo: null,
      isActive: true,
    },
    {
      id: ids.travelTariff,
      etaId: ids.eta,
      articleId: ids.articleTravel,
      unitId: getUnitId('KM'),
      categoryId: ids.tariffCategory,
      label: 'Deplacement kilometrique',
      unitPrice: 0.95,
      validFrom: '2026-01-01',
      validTo: null,
      isActive: true,
    },
    {
      id: ids.fuelTariff,
      etaId: ids.eta,
      articleId: ids.articleFuel,
      unitId: getUnitId('L'),
      categoryId: ids.tariffCategory,
      label: 'Carburant GNR',
      unitPrice: 1.35,
      validFrom: '2026-01-01',
      validTo: null,
      isActive: true,
    },
  ]);

  console.log(`Seed completed for ${adminEmail} on ETA ${ids.eta}.`);
}

void runSeed()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

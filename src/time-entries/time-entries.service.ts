import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { Article } from '../articles/article.entity';
import { ArticleType } from '../articles/enums/article-type.enum';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { Client } from '../clients/client.entity';
import { EtaRole } from '../common/enums/eta-role.enum';
import type { EtaContext } from '../common/interfaces/eta-context.interface';
import { Employee } from '../employees/employee.entity';
import { Material } from '../materials/material.entity';
import { Tariff } from '../tariffs/tariff.entity';
import {
  CreateTimeEntryConsumableDto,
  CreateTimeEntryDto,
  CreateTimeEntryMaterialDto,
  CreateTimeEntryQuantityDto,
} from './dto/create-time-entry.dto';
import { SearchTimeEntriesDto } from './dto/search-time-entries.dto';
import { TimeEntryOverlapsQueryDto } from './dto/time-entry-overlaps-query.dto';
import { TimeEntryStatsDto } from './dto/time-entry-stats.dto';
import { UpdateTimeEntryDto } from './dto/update-time-entry.dto';
import { TimeEntryConsumable } from './entities/time-entry-consumable.entity';
import { TimeEntryMaterial } from './entities/time-entry-material.entity';
import { TimeEntryQuantity } from './entities/time-entry-quantity.entity';
import { TimeEntry } from './entities/time-entry.entity';

type TimeRange = {
  startAt: Date;
  endAt: Date;
  durationMinutes: number;
  employeeMinutes: number;
};

type WeekBucket = {
  year: number;
  week: number;
  weekStart: string;
  weekEnd: string;
  totalMinutes: number;
};

type MonthBucket = {
  month: string;
  personalKm: number;
  personalAmount: number;
  clientWork: number;
  absence: number;
  travel: number;
  maintenance: number;
  etaWork: number;
};

@Injectable()
export class TimeEntriesService {
  private readonly msPerDay = 24 * 60 * 60 * 1000;

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(TimeEntry)
    private readonly timeEntriesRepository: Repository<TimeEntry>,
    @InjectRepository(Client)
    private readonly clientsRepository: Repository<Client>,
    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,
    @InjectRepository(Material)
    private readonly materialsRepository: Repository<Material>,
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
    @InjectRepository(Tariff)
    private readonly tariffsRepository: Repository<Tariff>,
  ) {}

  async create(
    currentEta: EtaContext,
    currentUser: AuthUser,
    dto: CreateTimeEntryDto,
  ): Promise<TimeEntry> {
    const range = this.buildRange(dto);
    await this.ensureReferences(currentEta.etaId, dto);
    const employee = await this.ensureScopedEntity(
      this.employeesRepository,
      currentEta.etaId,
      dto.employeeId,
      'Employee',
    );
    this.assertCanUseEmployee(currentEta, currentUser, employee);
    await this.assertNoOverlap(
      currentEta.etaId,
      dto.employeeId,
      range.startAt,
      range.endAt,
    );

    const saved = await this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(TimeEntry);
      const timeEntry = await repository.save(
        repository.create({
          etaId: currentEta.etaId,
          clientId: dto.clientId ?? null,
          employeeId: dto.employeeId,
          articleId: dto.articleId,
          createdByUserId: currentUser.userId,
          startAt: range.startAt,
          endAt: range.endAt,
          durationMinutes: range.durationMinutes,
          employeeMinutes: range.employeeMinutes,
          comment: dto.comment ?? null,
          personalKm: dto.personalKm ?? 0,
          personalAmount: dto.personalAmount ?? 0,
          halfDay: dto.halfDay ?? false,
          validatedAt: null,
          validatedByUserId: null,
        }),
      );

      await this.saveChildren(manager, timeEntry.id, dto);
      return timeEntry;
    });

    return this.findOne(currentEta, currentUser, saved.id);
  }

  async findOne(
    currentEta: EtaContext,
    currentUser: AuthUser,
    id: string,
  ): Promise<TimeEntry> {
    const timeEntry = await this.timeEntriesRepository.findOne({
      where: { id, etaId: currentEta.etaId },
      relations: {
        client: true,
        employee: true,
        article: true,
        materials: { material: true },
        quantities: { tariff: { article: true, unit: true, category: true } },
        consumables: {
          material: true,
          article: true,
          tariff: { article: true, unit: true, category: true },
        },
      },
    });

    if (!timeEntry) {
      throw new NotFoundException('Time entry not found.');
    }

    this.assertCanAccessTimeEntry(currentEta, currentUser, timeEntry);
    return timeEntry;
  }

  async search(
    currentEta: EtaContext,
    currentUser: AuthUser,
    dto: SearchTimeEntriesDto,
  ): Promise<TimeEntry[]> {
    const qb = this.timeEntriesRepository
      .createQueryBuilder('entry')
      .leftJoinAndSelect('entry.client', 'client')
      .leftJoinAndSelect('entry.employee', 'employee')
      .leftJoinAndSelect('entry.article', 'article')
      .leftJoinAndSelect('entry.materials', 'entryMaterial')
      .leftJoinAndSelect('entryMaterial.material', 'material')
      .leftJoinAndSelect('entry.quantities', 'quantity')
      .leftJoinAndSelect('quantity.tariff', 'quantityTariff')
      .leftJoinAndSelect('quantityTariff.unit', 'quantityUnit')
      .leftJoinAndSelect('quantityTariff.category', 'quantityCategory')
      .leftJoinAndSelect('entry.consumables', 'consumable')
      .leftJoinAndSelect('consumable.material', 'consumableMaterial')
      .leftJoinAndSelect('consumable.article', 'consumableArticle')
      .leftJoinAndSelect('consumable.tariff', 'consumableTariff')
      .where('entry.etaId = :etaId', { etaId: currentEta.etaId });

    if (dto.start) {
      qb.andWhere('entry.startAt >= :start', {
        start: this.parseDate(dto.start, 'start'),
      });
    }

    if (dto.end) {
      qb.andWhere('entry.endAt <= :end', {
        end: this.parseDate(dto.end, 'end'),
      });
    }

    if (dto.clientIds?.length) {
      qb.andWhere('entry.clientId IN (:...clientIds)', {
        clientIds: dto.clientIds,
      });
    }

    if (dto.employeeIds?.length) {
      qb.andWhere('entry.employeeId IN (:...employeeIds)', {
        employeeIds: dto.employeeIds,
      });
    }

    if (dto.articleIds?.length) {
      qb.andWhere('entry.articleId IN (:...articleIds)', {
        articleIds: dto.articleIds,
      });
    }

    if (dto.materialIds?.length) {
      qb.andWhere('entryMaterial.materialId IN (:...materialIds)', {
        materialIds: dto.materialIds,
      });
    }

    if (dto.isValidated === true) {
      qb.andWhere('entry.validatedAt IS NOT NULL');
    } else if (dto.isValidated === false) {
      qb.andWhere('entry.validatedAt IS NULL');
    }

    await this.applyReadScope(qb, currentEta, currentUser);

    return qb
      .orderBy('entry.startAt', 'DESC')
      .addOrderBy('entry.id', 'DESC')
      .getMany();
  }

  async update(
    currentEta: EtaContext,
    currentUser: AuthUser,
    id: string,
    dto: UpdateTimeEntryDto,
  ): Promise<TimeEntry> {
    const existing = await this.findOne(currentEta, currentUser, id);
    this.assertCanMutateTimeEntry(currentEta, existing);

    const employeeId = dto.employeeId ?? existing.employeeId;
    const range = this.buildRange(dto, existing);
    await this.ensureReferences(currentEta.etaId, {
      ...dto,
      employeeId,
      articleId: dto.articleId ?? existing.articleId,
      startAt: range.startAt.toISOString(),
      endAt: range.endAt.toISOString(),
    });
    const employee = await this.ensureScopedEntity(
      this.employeesRepository,
      currentEta.etaId,
      employeeId,
      'Employee',
    );
    this.assertCanUseEmployee(currentEta, currentUser, employee);
    await this.assertNoOverlap(
      currentEta.etaId,
      employeeId,
      range.startAt,
      range.endAt,
      id,
    );

    await this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(TimeEntry);
      await repository.save({
        ...existing,
        clientId:
          dto.clientId === undefined
            ? existing.clientId
            : (dto.clientId ?? null),
        employeeId,
        articleId: dto.articleId ?? existing.articleId,
        startAt: range.startAt,
        endAt: range.endAt,
        durationMinutes: range.durationMinutes,
        employeeMinutes: range.employeeMinutes,
        comment: dto.comment === undefined ? existing.comment : dto.comment,
        personalKm: dto.personalKm ?? existing.personalKm,
        personalAmount: dto.personalAmount ?? existing.personalAmount,
        halfDay: dto.halfDay ?? existing.halfDay,
      });

      await this.replaceChildren(manager, id, dto);
    });

    return this.findOne(currentEta, currentUser, id);
  }

  async remove(
    currentEta: EtaContext,
    currentUser: AuthUser,
    id: string,
  ): Promise<TimeEntry> {
    const existing = await this.findOne(currentEta, currentUser, id);
    this.assertCanMutateTimeEntry(currentEta, existing);
    await this.timeEntriesRepository.delete({ id, etaId: currentEta.etaId });
    return existing;
  }

  async getOverlaps(
    currentEta: EtaContext,
    currentUser: AuthUser,
    query: TimeEntryOverlapsQueryDto,
  ): Promise<TimeEntry[]> {
    const range = this.buildRange({
      startAt: query.start,
      endAt: query.end,
    });
    const employee = await this.ensureScopedEntity(
      this.employeesRepository,
      currentEta.etaId,
      query.employeeId,
      'Employee',
    );
    this.assertCanUseEmployee(currentEta, currentUser, employee);

    return this.findOverlaps(
      currentEta.etaId,
      query.employeeId,
      range.startAt,
      range.endAt,
      query.excludeTimeEntryId,
    );
  }

  async validate(
    currentEta: EtaContext,
    currentUser: AuthUser,
    timeEntryIds: string[],
  ): Promise<{ validated: number }> {
    const uniqueIds = [...new Set(timeEntryIds)];
    if (!uniqueIds.length) {
      throw new BadRequestException('No time entry ids provided.');
    }

    const entries = await this.timeEntriesRepository.find({
      where: {
        etaId: currentEta.etaId,
        id: In(uniqueIds),
      },
    });

    if (entries.length !== uniqueIds.length) {
      throw new NotFoundException('Some time entries were not found.');
    }

    const now = new Date();
    for (const entry of entries) {
      entry.validatedAt = now;
      entry.validatedByUserId = currentUser.userId;
    }

    await this.timeEntriesRepository.save(entries);
    return { validated: entries.length };
  }

  async statsByWeeks(
    currentEta: EtaContext,
    currentUser: AuthUser,
    dto: TimeEntryStatsDto,
  ): Promise<WeekBucket[]> {
    const startAt = this.parseDate(dto.start, 'start');
    const endAt = this.parseDate(dto.end, 'end');
    this.assertDateRange(startAt, endAt);

    const entries = await this.findForStats(
      currentEta,
      currentUser,
      dto,
      startAt,
      endAt,
    );
    const buckets = this.buildWeekBuckets(startAt, endAt);

    for (const entry of entries) {
      if (entry.article.type === ArticleType.ABSENCE) {
        continue;
      }

      const { year, week } = this.getIsoWeek(entry.startAt);
      const key = `${year}-${week}`;
      const bucket = buckets.get(key);
      if (bucket) {
        bucket.totalMinutes += entry.employeeMinutes;
      }
    }

    return [...buckets.values()];
  }

  async statsByMonths(
    currentEta: EtaContext,
    currentUser: AuthUser,
    dto: TimeEntryStatsDto,
  ): Promise<MonthBucket[]> {
    const startAt = this.parseDate(dto.start, 'start');
    const endAt = this.parseDate(dto.end, 'end');
    this.assertDateRange(startAt, endAt);

    const entries = await this.findForStats(
      currentEta,
      currentUser,
      dto,
      startAt,
      endAt,
    );
    const buckets = this.buildMonthBuckets(startAt, endAt);

    for (const entry of entries) {
      const key = `${entry.startAt.getUTCMonth() + 1}-${entry.startAt.getUTCFullYear()}`;
      const bucket = buckets.get(key);
      if (!bucket) {
        continue;
      }

      bucket.personalKm += entry.personalKm;
      bucket.personalAmount += entry.personalAmount;
      this.addTimeToMonthBucket(
        bucket,
        entry.article.type,
        entry.employeeMinutes,
      );
    }

    return [...buckets.values()];
  }

  private async ensureReferences(
    etaId: string,
    dto: Partial<CreateTimeEntryDto> & {
      employeeId: string;
      articleId: string;
      startAt: string;
      endAt: string;
    },
  ): Promise<void> {
    if (dto.clientId) {
      await this.ensureScopedEntity(
        this.clientsRepository,
        etaId,
        dto.clientId,
        'Client',
      );
    }

    await Promise.all([
      this.ensureScopedEntity(
        this.employeesRepository,
        etaId,
        dto.employeeId,
        'Employee',
      ),
      this.ensureScopedEntity(
        this.articlesRepository,
        etaId,
        dto.articleId,
        'Article',
      ),
      ...this.unique((dto.materials ?? []).map((item) => item.materialId)).map(
        (id) =>
          this.ensureScopedEntity(
            this.materialsRepository,
            etaId,
            id,
            'Material',
          ),
      ),
      ...this.unique((dto.quantities ?? []).map((item) => item.tariffId)).map(
        (id) =>
          this.ensureScopedEntity(this.tariffsRepository, etaId, id, 'Tariff'),
      ),
      ...this.unique(
        (dto.consumables ?? [])
          .map((item) => item.materialId)
          .filter((id): id is string => Boolean(id)),
      ).map((id) =>
        this.ensureScopedEntity(
          this.materialsRepository,
          etaId,
          id,
          'Material',
        ),
      ),
      ...this.unique((dto.consumables ?? []).map((item) => item.articleId)).map(
        (id) =>
          this.ensureScopedEntity(
            this.articlesRepository,
            etaId,
            id,
            'Article',
          ),
      ),
      ...this.unique(
        (dto.consumables ?? [])
          .map((item) => item.tariffId)
          .filter((id): id is string => Boolean(id)),
      ).map((id) =>
        this.ensureScopedEntity(this.tariffsRepository, etaId, id, 'Tariff'),
      ),
    ]);
  }

  private async ensureScopedEntity<T extends { id: string; etaId: string }>(
    repository: Repository<T>,
    etaId: string,
    id: string,
    label: string,
  ): Promise<T> {
    const entity = await repository
      .createQueryBuilder('entity')
      .where('entity.id = :id', { id })
      .andWhere('entity.etaId = :etaId', { etaId })
      .getOne();

    if (!entity) {
      throw new NotFoundException(`${label} not found.`);
    }

    return entity;
  }

  private buildRange(
    dto: Partial<
      Pick<
        CreateTimeEntryDto,
        'startAt' | 'endAt' | 'durationMinutes' | 'employeeMinutes'
      >
    >,
    existing?: TimeEntry,
  ): TimeRange {
    const startAt = dto.startAt
      ? this.parseDate(dto.startAt, 'startAt')
      : existing?.startAt;
    const endAt = dto.endAt
      ? this.parseDate(dto.endAt, 'endAt')
      : existing?.endAt;

    if (!startAt || !endAt) {
      throw new BadRequestException('startAt and endAt are required.');
    }

    this.assertDateRange(startAt, endAt);

    const datesChanged = Boolean(dto.startAt || dto.endAt);
    const computedDuration = Math.round(
      (endAt.getTime() - startAt.getTime()) / (60 * 1000),
    );
    const durationMinutes =
      dto.durationMinutes ??
      (datesChanged ? computedDuration : existing?.durationMinutes);
    const employeeMinutes =
      dto.employeeMinutes ??
      (dto.durationMinutes || datesChanged
        ? durationMinutes
        : existing?.employeeMinutes);

    if (
      !durationMinutes ||
      durationMinutes <= 0 ||
      employeeMinutes === undefined
    ) {
      throw new BadRequestException('Duration must be greater than zero.');
    }

    return {
      startAt,
      endAt,
      durationMinutes,
      employeeMinutes,
    };
  }

  private parseDate(value: string, fieldName: string): Date {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`${fieldName} is not a valid date.`);
    }

    return date;
  }

  private assertDateRange(startAt: Date, endAt: Date): void {
    if (endAt.getTime() <= startAt.getTime()) {
      throw new BadRequestException('endAt must be after startAt.');
    }
  }

  private async assertNoOverlap(
    etaId: string,
    employeeId: string,
    startAt: Date,
    endAt: Date,
    excludeId?: string,
  ): Promise<void> {
    const overlaps = await this.findOverlaps(
      etaId,
      employeeId,
      startAt,
      endAt,
      excludeId,
    );

    if (overlaps.length) {
      throw new ConflictException(
        'Employee already has a time entry in this range.',
      );
    }
  }

  private findOverlaps(
    etaId: string,
    employeeId: string,
    startAt: Date,
    endAt: Date,
    excludeId?: string,
  ): Promise<TimeEntry[]> {
    const qb = this.timeEntriesRepository
      .createQueryBuilder('entry')
      .leftJoinAndSelect('entry.client', 'client')
      .leftJoinAndSelect('entry.employee', 'employee')
      .leftJoinAndSelect('entry.article', 'article')
      .where('entry.etaId = :etaId', { etaId })
      .andWhere('entry.employeeId = :employeeId', { employeeId })
      .andWhere('entry.startAt < :endAt', { endAt })
      .andWhere('entry.endAt > :startAt', { startAt });

    if (excludeId) {
      qb.andWhere('entry.id <> :excludeId', { excludeId });
    }

    return qb.orderBy('entry.startAt', 'ASC').getMany();
  }

  private async saveChildren(
    manager: EntityManager,
    timeEntryId: string,
    dto: Partial<CreateTimeEntryDto>,
  ): Promise<void> {
    await Promise.all([
      this.saveMaterials(manager, timeEntryId, dto.materials ?? []),
      this.saveQuantities(manager, timeEntryId, dto.quantities ?? []),
      this.saveConsumables(manager, timeEntryId, dto.consumables ?? []),
    ]);
  }

  private async replaceChildren(
    manager: EntityManager,
    timeEntryId: string,
    dto: UpdateTimeEntryDto,
  ): Promise<void> {
    if (dto.materials !== undefined) {
      await manager.getRepository(TimeEntryMaterial).delete({ timeEntryId });
      await this.saveMaterials(manager, timeEntryId, dto.materials);
    }

    if (dto.quantities !== undefined) {
      await manager.getRepository(TimeEntryQuantity).delete({ timeEntryId });
      await this.saveQuantities(manager, timeEntryId, dto.quantities);
    }

    if (dto.consumables !== undefined) {
      await manager.getRepository(TimeEntryConsumable).delete({ timeEntryId });
      await this.saveConsumables(manager, timeEntryId, dto.consumables);
    }
  }

  private async saveMaterials(
    manager: EntityManager,
    timeEntryId: string,
    materials: CreateTimeEntryMaterialDto[],
  ): Promise<void> {
    if (!materials.length) {
      return;
    }

    const repository = manager.getRepository(TimeEntryMaterial);
    await repository.save(
      materials.map((item) =>
        repository.create({
          timeEntryId,
          materialId: item.materialId,
          meterStart: item.meterStart ?? null,
          meterEnd: item.meterEnd ?? null,
        }),
      ),
    );
  }

  private async saveQuantities(
    manager: EntityManager,
    timeEntryId: string,
    quantities: CreateTimeEntryQuantityDto[],
  ): Promise<void> {
    if (!quantities.length) {
      return;
    }

    const repository = manager.getRepository(TimeEntryQuantity);
    await repository.save(
      quantities.map((item) =>
        repository.create({
          timeEntryId,
          tariffId: item.tariffId,
          quantity: item.quantity,
        }),
      ),
    );
  }

  private async saveConsumables(
    manager: EntityManager,
    timeEntryId: string,
    consumables: CreateTimeEntryConsumableDto[],
  ): Promise<void> {
    if (!consumables.length) {
      return;
    }

    const repository = manager.getRepository(TimeEntryConsumable);
    await repository.save(
      consumables.map((item) =>
        repository.create({
          timeEntryId,
          materialId: item.materialId ?? null,
          articleId: item.articleId,
          tariffId: item.tariffId ?? null,
          quantity: item.quantity,
          meterStart: item.meterStart ?? null,
          meterEnd: item.meterEnd ?? null,
        }),
      ),
    );
  }

  private assertCanUseEmployee(
    currentEta: EtaContext,
    currentUser: AuthUser,
    employee: Employee,
  ): void {
    if (this.canManageTimeEntries(currentEta.role)) {
      return;
    }

    if (
      currentEta.role === EtaRole.EMPLOYEE &&
      employee.userId === currentUser.userId
    ) {
      return;
    }

    throw new ForbiddenException('Cannot use this employee for time entries.');
  }

  private assertCanAccessTimeEntry(
    currentEta: EtaContext,
    currentUser: AuthUser,
    timeEntry: TimeEntry,
  ): void {
    if (this.canManageTimeEntries(currentEta.role)) {
      return;
    }

    if (
      currentEta.role === EtaRole.EMPLOYEE &&
      timeEntry.employee.userId === currentUser.userId
    ) {
      return;
    }

    throw new ForbiddenException('Cannot access this time entry.');
  }

  private assertCanMutateTimeEntry(
    currentEta: EtaContext,
    timeEntry: TimeEntry,
  ): void {
    if (timeEntry.validatedAt && !this.canManageTimeEntries(currentEta.role)) {
      throw new ForbiddenException('Validated time entries cannot be changed.');
    }
  }

  private canManageTimeEntries(role: EtaRole): boolean {
    return [EtaRole.OWNER, EtaRole.ADMIN, EtaRole.MATERIAL_MANAGER].includes(
      role,
    );
  }

  private async applyReadScope(
    qb: ReturnType<Repository<TimeEntry>['createQueryBuilder']>,
    currentEta: EtaContext,
    currentUser: AuthUser,
  ): Promise<void> {
    if (this.canManageTimeEntries(currentEta.role)) {
      return;
    }

    if (currentEta.role !== EtaRole.EMPLOYEE) {
      throw new ForbiddenException('Cannot list time entries.');
    }

    const employee = await this.employeesRepository.findOne({
      where: {
        etaId: currentEta.etaId,
        userId: currentUser.userId,
        isActive: true,
      },
    });

    if (!employee) {
      qb.andWhere('1 = 0');
      return;
    }

    qb.andWhere('entry.employeeId = :currentEmployeeId', {
      currentEmployeeId: employee.id,
    });
  }

  private async findForStats(
    currentEta: EtaContext,
    currentUser: AuthUser,
    dto: TimeEntryStatsDto,
    startAt: Date,
    endAt: Date,
  ): Promise<TimeEntry[]> {
    const qb = this.timeEntriesRepository
      .createQueryBuilder('entry')
      .leftJoinAndSelect('entry.employee', 'employee')
      .leftJoinAndSelect('entry.article', 'article')
      .where('entry.etaId = :etaId', { etaId: currentEta.etaId })
      .andWhere('entry.startAt >= :startAt', { startAt })
      .andWhere('entry.endAt <= :endAt', { endAt });

    if (dto.employeeIds?.length) {
      qb.andWhere('entry.employeeId IN (:...employeeIds)', {
        employeeIds: dto.employeeIds,
      });
    }

    await this.applyReadScope(qb, currentEta, currentUser);
    return qb.getMany();
  }

  private addTimeToMonthBucket(
    bucket: MonthBucket,
    type: ArticleType,
    employeeMinutes: number,
  ): void {
    switch (type) {
      case ArticleType.BILLABLE:
      case ArticleType.CLIENT_SERVICE:
        bucket.clientWork += employeeMinutes;
        break;
      case ArticleType.ABSENCE:
        bucket.absence += employeeMinutes;
        break;
      case ArticleType.TRAVEL:
        bucket.travel += employeeMinutes;
        break;
      case ArticleType.MAINTENANCE:
        bucket.maintenance += employeeMinutes;
        break;
      case ArticleType.GENERAL_WORK:
      case ArticleType.CONSUMABLE:
        bucket.etaWork += employeeMinutes;
        break;
    }
  }

  private buildWeekBuckets(
    startAt: Date,
    endAt: Date,
  ): Map<string, WeekBucket> {
    const buckets = new Map<string, WeekBucket>();
    let cursor = this.startOfIsoWeek(startAt);
    const last = this.startOfIsoWeek(endAt);

    while (cursor.getTime() <= last.getTime()) {
      const { year, week } = this.getIsoWeek(cursor);
      const weekEnd = new Date(cursor.getTime() + 6 * this.msPerDay);
      buckets.set(`${year}-${week}`, {
        year,
        week,
        weekStart: this.formatDate(cursor),
        weekEnd: this.formatDate(weekEnd),
        totalMinutes: 0,
      });
      cursor = new Date(cursor.getTime() + 7 * this.msPerDay);
    }

    return buckets;
  }

  private buildMonthBuckets(
    startAt: Date,
    endAt: Date,
  ): Map<string, MonthBucket> {
    const buckets = new Map<string, MonthBucket>();
    let cursor = new Date(
      Date.UTC(startAt.getUTCFullYear(), startAt.getUTCMonth(), 1),
    );
    const last = new Date(
      Date.UTC(endAt.getUTCFullYear(), endAt.getUTCMonth(), 1),
    );

    while (cursor.getTime() <= last.getTime()) {
      const monthNumber = cursor.getUTCMonth() + 1;
      const year = cursor.getUTCFullYear();
      buckets.set(`${monthNumber}-${year}`, {
        month: `${this.pad(monthNumber)}/${year}`,
        personalKm: 0,
        personalAmount: 0,
        clientWork: 0,
        absence: 0,
        travel: 0,
        maintenance: 0,
        etaWork: 0,
      });
      cursor = new Date(Date.UTC(year, monthNumber, 1));
    }

    return buckets;
  }

  private getIsoWeek(date: Date): { year: number; week: number } {
    const value = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
    const day = value.getUTCDay() || 7;
    value.setUTCDate(value.getUTCDate() + 4 - day);
    const year = value.getUTCFullYear();
    const yearStart = new Date(Date.UTC(year, 0, 1));
    const week = Math.ceil(
      ((value.getTime() - yearStart.getTime()) / this.msPerDay + 1) / 7,
    );
    return { year, week };
  }

  private startOfIsoWeek(date: Date): Date {
    const value = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
    const day = value.getUTCDay() || 7;
    value.setUTCDate(value.getUTCDate() - day + 1);
    return value;
  }

  private formatDate(date: Date): string {
    return `${this.pad(date.getUTCDate())}/${this.pad(
      date.getUTCMonth() + 1,
    )}/${date.getUTCFullYear()}`;
  }

  private pad(value: number): string {
    return String(value).padStart(2, '0');
  }

  private unique(values: string[]): string[] {
    return [...new Set(values)];
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientsRepository: Repository<Client>,
  ) {}

  findAll(etaId: string): Promise<Client[]> {
    return this.clientsRepository.find({
      where: { etaId },
      order: { displayName: 'ASC' },
    });
  }

  async findOne(etaId: string, id: string): Promise<Client> {
    const client = await this.clientsRepository.findOne({
      where: { id, etaId },
    });

    if (!client) {
      throw new NotFoundException('Client not found.');
    }

    return client;
  }

  create(etaId: string, dto: CreateClientDto): Promise<Client> {
    return this.clientsRepository.save(
      this.clientsRepository.create({
        ...dto,
        etaId,
        code: dto.code ?? null,
        contactName: dto.contactName ?? null,
        email: dto.email ?? null,
        phone: dto.phone ?? null,
        notes: dto.notes ?? null,
        isActive: dto.isActive ?? true,
      }),
    );
  }

  async update(
    etaId: string,
    id: string,
    dto: UpdateClientDto,
  ): Promise<Client> {
    const client = await this.findOne(etaId, id);
    Object.assign(client, dto);
    return this.clientsRepository.save(client);
  }
}

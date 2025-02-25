import { Controller, Get, Post, Body, Put, Param, Delete, Logger } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { Roles, Unprotected } from 'nest-keycloak-connect';

@ApiTags('clients')
@Controller('clients')
export class ClientsController {
  private readonly logger = new Logger(ClientsController.name);
  
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @Unprotected()
  findAll(): Promise<Client[]> {
    this.logger.debug('Finding all clients - unprotected endpoint');
    return this.clientsService.findAll();
  }

  @Get(':id')
  @Unprotected()
  findOne(@Param('id') id: number): Promise<Client> {
    this.logger.debug(`Finding client with id ${id} - unprotected endpoint`);
    return this.clientsService.findOne(id);
  }

  @Post()
  @ApiBearerAuth('access-token')
  @Roles({ roles: ['admin'] })
  create(@Body() createClientDto: CreateClientDto): Promise<Client> {
    this.logger.debug('Creating client - requires admin role');
    return this.clientsService.create(createClientDto);
  }

  @Put(':id')
  @ApiBearerAuth('access-token')
  @Roles({ roles: ['admin'] })
  update(@Param('id') id: number, @Body() updateClientDto: Partial<CreateClientDto>): Promise<Client> {
    this.logger.debug(`Updating client ${id} - requires admin role`);
    return this.clientsService.update(id, updateClientDto);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @Roles({ roles: ['admin'] })
  remove(@Param('id') id: number): Promise<void> {
    this.logger.debug(`Removing client ${id} - requires admin role`);
    return this.clientsService.remove(id);
  }
}
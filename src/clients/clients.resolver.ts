import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ClientsService } from './clients.service';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { Roles, Unprotected } from 'nest-keycloak-connect';

@Resolver(() => Client)
export class ClientsResolver {
  constructor(private readonly clientsService: ClientsService) {}

  @Query(() => [Client])
  @Unprotected()
  clients(): Promise<Client[]> {
    return this.clientsService.findAll();
  }

  @Query(() => Client)
  @Unprotected()
  client(@Args('id', { type: () => ID }) id: number): Promise<Client> {
    return this.clientsService.findOne(id);
  }

  @Mutation(() => Client)
  @Roles({ roles: ['admin'] })
  createClient(@Args('input') createClientDto: CreateClientDto): Promise<Client> {
    return this.clientsService.create(createClientDto);
  }

  @Mutation(() => Client)
  @Roles({ roles: ['admin'] })
  updateClient(
    @Args('id', { type: () => ID }) id: number,
    @Args('input') updateClientDto: CreateClientDto,
  ): Promise<Client> {
    return this.clientsService.update(id, updateClientDto);
  }

  @Mutation(() => Boolean)
  @Roles({ roles: ['admin'] })
  async removeClient(@Args('id', { type: () => ID }) id: number): Promise<boolean> {
    await this.clientsService.remove(id);
    return true;
  }
}
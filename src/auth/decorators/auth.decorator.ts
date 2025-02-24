import { applyDecorators, SetMetadata } from '@nestjs/common';
import { Role } from '../roles.enum';
import { Resource, Scopes } from 'nest-keycloak-connect';

export function Auth(resource: string, roles: Role[] = []) {
  return applyDecorators(
    Resource(resource),
    Scopes(...roles),
  );
}
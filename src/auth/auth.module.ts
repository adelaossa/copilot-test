import { Module, Logger } from '@nestjs/common';
import { KeycloakConnectModule, AuthGuard, ResourceGuard, RoleGuard, TokenValidation, PolicyEnforcementMode } from 'nest-keycloak-connect';
import { APP_GUARD } from '@nestjs/core';

const logger = new Logger('KeycloakAuth');

@Module({
  imports: [
    KeycloakConnectModule.registerAsync({
      useFactory: () => {
        logger.debug('Initializing Keycloak configuration');
        return {
          authServerUrl: process.env.KEYCLOAK_AUTH_SERVER_URL as string,
          realm: process.env.KEYCLOAK_REALM as string,
          clientId: process.env.KEYCLOAK_CLIENT_ID as string,
          secret: process.env.KEYCLOAK_SECRET as string,
          policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
          tokenValidation: TokenValidation.NONE,
          useNestLogger: true,
          verifyTokenAudience: false,
          bearerOnly: false,
          graphqlGuard: {
            enabled: true
          }
        };
      },
    }),
  ],
  providers: [
    Logger,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ResourceGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
  exports: [KeycloakConnectModule],
})
export class AuthModule {}
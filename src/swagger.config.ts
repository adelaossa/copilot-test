import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication): void {
  const options = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API description')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'oauth2',
        flows: {
          implicit: {
            authorizationUrl: `${process.env.KEYCLOAK_AUTH_SERVER_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/auth`,
            tokenUrl: `${process.env.KEYCLOAK_AUTH_SERVER_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`,
            scopes: {
              'profile': 'Profile information',
              'email': 'Email information',
              'roles': 'User roles',
            }
          },
        },
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, options);
  
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      oauth2RedirectUrl: 'http://localhost:3000/api-docs/oauth2-redirect.html',
      initOAuth: {
        clientId: process.env.KEYCLOAK_CLIENT_ID,
        realm: process.env.KEYCLOAK_REALM,
        appName: 'NestJS API',
        usePkceWithAuthorizationCodeGrant: true
      },
      persistAuthorization: true
    },
    customSiteTitle: 'API Documentation',
  });
}

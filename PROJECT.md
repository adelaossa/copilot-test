# NestJS Invoice Management System

## Project Overview

This project is a comprehensive invoice management system built with NestJS, providing REST API and GraphQL endpoints. It integrates Keycloak for authentication and authorization, and uses PostgreSQL for data storage.

## Features

- **Authentication & Authorization**: Secure API access with Keycloak integration
- **GraphQL API**: Modern, efficient API with GraphQL
- **REST API**: Traditional REST endpoints with Swagger documentation
- **Multiple Business Modules**:
  - **Clients**: Client management
  - **Products**: Product catalog management
  - **Invoices**: Invoice creation and processing
  - **Payments**: Payment tracking and processing

## Tech Stack

- **Backend Framework**: NestJS
- **API Technologies**: 
  - REST API with Swagger documentation
  - GraphQL with Apollo Server
- **Authentication**: Keycloak
- **Database**: PostgreSQL with TypeORM
- **Environment**: Docker containerization for services
- **Development**: TypeScript

## Architecture

The application follows NestJS's modular architecture, with distinct modules for each part of the business logic:

```
src/
├── app.module.ts        # Main application module
├── main.ts             # Application entry point
├── auth/               # Authentication and authorization
├── clients/            # Client management
├── invoices/           # Invoice processing
├── payments/           # Payment processing
├── products/           # Product management
└── shared/             # Shared utilities and components
```

## Project Setup

### Prerequisites

- Node.js and npm
- Docker and Docker Compose

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Configuration

The project uses a `.env` file for configuration. Create a `.env` file in the project root with the following variables:

```
# App
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=copdb
DB_USER=copuser
DB_PASS=coppass

# Keycloak Database
KEYCLOAK_DB_PORT=5433
KEYCLOAK_DB_USER=keycloak
KEYCLOAK_DB_PASSWORD=keycloak
KEYCLOAK_DB_NAME=keycloak

# Keycloak
KEYCLOAK_PORT=8080
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=admin
KEYCLOAK_AUTH_SERVER_URL=http://localhost:8080
KEYCLOAK_REALM=your-realm
KEYCLOAK_CLIENT_ID=your-client-id
KEYCLOAK_SECRET=your-client-secret
KEYCLOAK_FEATURES=token-exchange
```

### Starting Services

The project uses Docker Compose to run Keycloak and PostgreSQL databases:

```bash
# Start all services
docker-compose up -d

# To view logs
docker-compose logs -f
```

### Compile and Run

```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod
```

## API Documentation

- **Swagger UI**: Available at `http://localhost:3000/api` when the application is running
- **GraphQL Playground**: Available at `http://localhost:3000/graphql` when the application is running

## Keycloak Administration

- **Admin Console**: `http://localhost:8080/admin`
- **Default Credentials**: admin/admin (configurable in `.env`)
- **Realm Configuration**: The system uses a pre-configured realm from `realm-config.json`

## Development

### Adding Seed Data

The system includes seeders for development environments:
- Products seeder
- Clients seeder
- Invoices seeder

These are automatically run in development mode.

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Deployment

For production deployment:

1. Ensure environment variables are properly configured
2. Build the application: `npm run build`
3. Start the application: `npm run start:prod`

For cloud deployment, you can use NestJS's official platform, Mau:

```bash
npm install -g mau
mau deploy
```

## License

This project is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
# my_eta_planning_backend

Backend NestJS allege pour la future application de planning ETA.

Ce premier increment pose le socle technique :

- NestJS 11
- PostgreSQL via TypeORM
- configuration par variables d'environnement
- migrations TypeORM
- Swagger sur `/api/docs`
- healthcheck sur `/api/health`
- validation globale des DTO

## Demarrage local

Installer les dependances puis copier l'exemple d'environnement :

```bash
cp .env.example .env
```

Demarrer PostgreSQL :

```bash
docker compose up -d postgres
```

Demarrer l'API :

```bash
npm run start:dev
```

L'API ecoute par defaut sur `http://localhost:3000/api`.

## Base de donnees

Les scripts TypeORM utilisent `src/database/data-source.ts`.

```bash
npm run migration:create -- src/database/migrations/NomMigration
npm run migration:generate -- src/database/migrations/NomMigration
npm run migration:run
npm run migration:revert
```

## Prochain increment

Le prochain pas logique est l'auth integree :

- `users`
- hash de mot de passe
- login JWT
- refresh tokens stockes en PostgreSQL
- contexte `etaId` et premiers roles

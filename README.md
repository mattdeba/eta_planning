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

Le deuxieme increment ajoute :

- authentification integree (JWT access + refresh token)
- structure multi-tenant ETA (`etas`, `users`, `eta_users`)
- persistence des refresh tokens en base
- migration initiale avec donnees de demarrage
- execution API + PostgreSQL via Docker Compose

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

Executer les migrations :

```bash
npm run migration:run
```

## Demarrage complet via Docker

```bash
docker compose up -d --build
```

API :

- `http://localhost:3000/api`
- Swagger : `http://localhost:3000/api/docs`

## Base de donnees

Les scripts TypeORM utilisent `src/database/data-source.ts`.

```bash
npm run migration:create -- src/database/migrations/NomMigration
npm run migration:generate -- src/database/migrations/NomMigration
npm run migration:run
npm run migration:revert
```

## Auth (dev)

Utilisateur de demarrage cree par la migration :

- email: `admin@eta.local`
- mot de passe: `ChangeMe123!`

Endpoints :

- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

## Prochain increment

Le prochain pas logique est la partie fonctionnelle saisie des temps :

- referentiels metiers ETA (clients, salaries, materiels, articles, tarifs)
- entites `time_entries` (equivalent bon chantier)
- endpoints CRUD + recherche
- regles de chevauchement et validation

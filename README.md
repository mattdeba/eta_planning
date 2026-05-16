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

Le troisieme increment ajoute :

- contexte ETA par token ou header `x-current-eta-id`
- garde de roles ETA (`owner`, `admin`, `employee`, `material_manager`)
- referentiels metiers : clients, salaries, materiels, articles, unites, tarifs
- entites `time_entries`, `time_entry_materials`, `time_entry_quantities`, `time_entry_consumables`
- creation transactionnelle d'une saisie complete
- recherche, controle de chevauchement salarie, validation, stats semaines/mois

Le quatrieme increment durcit l'API :

- documentation Swagger complete des routes, DTOs, reponses et erreurs standard
- schemas Swagger exposes pour les entites retournees par l'API
- validation UUID sur les parametres `:id`
- environnements separes pour test et production
- seed idempotent des donnees de demonstration
- tests e2e couvrant chaque route HTTP exposee

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

Initialiser les donnees de demonstration :

```bash
npm run seed
```

## Demarrage complet via Docker

```bash
docker compose up -d --build
```

API :

- `http://localhost:3000/api`
- Swagger : `http://localhost:3000/api/docs`

## Environnements

Les fichiers sont charges dans cet ordre :

```text
.env.<NODE_ENV>.local
.env.<NODE_ENV>
.env
```

Fichiers versionnes :

- `.env.example` : base locale
- `.env.test` : configuration de test, avec PostgreSQL sur `5434`
- `.env.production.example` : modele production sans vrai secret

En production, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` et les informations PostgreSQL doivent etre fournis explicitement. Les secrets de developpement sont refuses.

Base PostgreSQL de test :

```bash
docker compose -f docker-compose.test.yml up -d postgres-test
```

## Base de donnees

Les scripts TypeORM utilisent `src/database/data-source.ts`.

```bash
npm run migration:create -- src/database/migrations/NomMigration
npm run migration:generate -- src/database/migrations/NomMigration
npm run migration:run
npm run migration:revert
npm run migration:show
```

## Seed

Le seed est idempotent et peuple l'ETA de demonstration, deux utilisateurs, des referentiels metiers et des tarifs standards.

```bash
npm run seed
npm run seed:test
NODE_ENV=production SEED_ADMIN_PASSWORD='...' npm run seed
```

En production, `SEED_ADMIN_PASSWORD` doit etre defini et different du mot de passe de demonstration.

## Tests

```bash
npm test
npm run test:e2e
npm run lint
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

## API metier

Le backend expose maintenant les premieres routes metier protegees par JWT :

- `GET /api/etas/current`
- `GET|POST|PATCH /api/clients`
- `GET|POST|PATCH /api/employees`
- `GET|POST|PATCH /api/materials`
- `GET|POST|PATCH /api/articles`
- `GET|POST|PATCH /api/units`
- `GET|POST|PATCH /api/tariffs`
- `GET|POST|PATCH /api/tariffs/categories`
- `POST /api/time-entries`
- `POST /api/time-entries/search`
- `GET /api/time-entries/overlaps`
- `GET|PATCH|DELETE /api/time-entries/:id`
- `POST /api/time-entries/validate`
- `POST /api/time-entries/stats/weeks`
- `POST /api/time-entries/stats/months`

Pour selectionner une ETA differente de l'ETA active du token, envoyer :

```http
x-current-eta-id: <eta-id>
```

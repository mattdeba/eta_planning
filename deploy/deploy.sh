#!/usr/bin/env bash
# Déploiement de my_eta_planning (backend NestJS + frontend Angular + PostgreSQL).
#
#   ./deploy.sh
#
# Étapes :
#   1. Synchronise le code des repos locaux vers /opt/my_eta_planning
#      (sans jamais toucher aux fichiers .env* présents sur le serveur)
#   2. Rebuild + redémarrage des conteneurs (postgres, api, frontend)
#   3. Seed de la base au premier déploiement uniquement
#   4. Vérifications de santé (api + frontend)
#
# À installer sur le serveur dans /opt/my_eta_planning/deploy.sh.
set -euo pipefail

REPO_BACKEND="${REPO_BACKEND:-/home/eta_planning}"
REPO_FRONTEND="${REPO_FRONTEND:-/home/eta_planning_frontend}"
ROOT=/opt/my_eta_planning

LOCK_FILE="$ROOT/.deploy.lock"
exec 9>"$LOCK_FILE"
flock 9

for d in "$REPO_BACKEND" "$REPO_FRONTEND"; do
  if [ ! -d "$d" ]; then
    echo "Repo introuvable : $d" >&2
    exit 1
  fi
done

if [ ! -f "$ROOT/backend/.env.production" ]; then
  echo "Manque $ROOT/backend/.env.production" >&2
  echo "Le créer à partir de .env.production.example (voir deploy/DEPLOYMENT.md)." >&2
  exit 1
fi

RSYNC_EXCLUDES=(
  --exclude=.git --exclude=node_modules --exclude=dist
  --exclude=coverage --exclude=.angular --exclude=.idea
  --exclude=.env '--exclude=.env.*'
)

echo "==> Synchronisation du backend"
rsync -a --delete --chown=deploy:deploy "${RSYNC_EXCLUDES[@]}" \
  "$REPO_BACKEND/" "$ROOT/backend/"

echo "==> Synchronisation du frontend"
rsync -a --delete --chown=deploy:deploy "${RSYNC_EXCLUDES[@]}" \
  "$REPO_FRONTEND/" "$ROOT/frontend/"

BACKEND_COMPOSE=(docker compose --env-file "$ROOT/backend/.env.production" -f "$ROOT/backend/docker-compose.production.yml")
FRONTEND_COMPOSE=(docker compose -f "$ROOT/frontend/docker-compose.production.yml")

if ! docker network inspect my_eta_planning >/dev/null 2>&1; then
  echo "==> Création du réseau docker my_eta_planning"
  docker network create my_eta_planning >/dev/null
fi

echo "==> Build + démarrage postgres / api"
"${BACKEND_COMPOSE[@]}" up -d --build postgres api

api_ready=0
for _ in $(seq 1 90); do
  if curl -fsS http://127.0.0.1:3000/api/health >/dev/null; then
    api_ready=1
    break
  fi
  sleep 2
done

if [ "$api_ready" -ne 1 ]; then
  echo "Le backend n'est pas devenu sain." >&2
  docker logs --tail 200 my_eta_planning_api >&2 || true
  exit 1
fi

if [ ! -f "$ROOT/.seeded" ]; then
  echo "==> Seed initial de la base de données"
  "${BACKEND_COMPOSE[@]}" --profile seed run --rm seed
  touch "$ROOT/.seeded"
fi

echo "==> Build + démarrage frontend"
"${FRONTEND_COMPOSE[@]}" up -d --build

frontend_ready=0
for _ in $(seq 1 60); do
  if curl -fsS -I http://127.0.0.1:8099 >/dev/null; then
    frontend_ready=1
    break
  fi
  sleep 2
done

if [ "$frontend_ready" -ne 1 ]; then
  echo "Le frontend n'est pas devenu sain." >&2
  docker logs --tail 200 my_eta_planning_frontend >&2 || true
  exit 1
fi

echo "==> Déploiement terminé"
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}'

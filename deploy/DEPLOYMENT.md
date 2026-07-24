# Déploiement de my_eta_planning

Application complète : frontend Angular + backend NestJS + PostgreSQL,
servie sur l'IP publique du serveur (`http://194.164.76.69`).

## Architecture

```
Internet
   │  http://194.164.76.69  (port 80, seul port public)
   ▼
nginx (hôte)                     ← /etc/nginx/sites-enabled/default
   ├─ /            → frontend   127.0.0.1:8099  (conteneur, Express + Angular)
   └─ /api/*       → backend    127.0.0.1:3000  (conteneur, NestJS)
                         │
                         ▼  réseau docker interne « my_eta_planning »
                      PostgreSQL   (conteneur, non exposé à l'hôte)
```

- Le frontend sert l'application Angular et reçoit `/api/*` via nginx.
- Le backend et PostgreSQL ne sont jamais exposés publiquement.
- Les conteneurs ont `restart: unless-stopped` ; docker et nginx sont
  activés au boot : l'application survit aux redémarrages du serveur.
- Les données PostgreSQL sont dans le volume docker
  `my_eta_planning_postgres_data`.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `deploy/deploy.sh` | Déploiement complet : sync du code, build, redémarrage, seed, health checks |
| `docker-compose.production.yml` (backend) | postgres + api + profil `seed` |
| `docker-compose.production.yml` (frontend) | frontend |
| `deploy/nginx-my_eta_planning.conf` | reverse proxy (copie de référence de la conf live) |
| `/opt/my_eta_planning/backend/.env.production` | secrets de production (sur le serveur uniquement, jamais versionné) |

Sur le serveur, tout est installé sous `/opt/my_eta_planning/` :
`backend/`, `frontend/`, `deploy.sh`, `.seeded` (marqueur de seed).

## Mettre à jour l'application (usage courant)

Après avoir modifié le code dans `/home/eta_planning` et/ou
`/home/eta_planning_frontend` :

```bash
/opt/my_eta_planning/deploy.sh
```

Le script synchronise le code vers `/opt`, rebuild les images, redémarre
les conteneurs, applique les migrations TypeORM (au démarrage de l'api) et
vérifie que tout répond. Il est idempotent et peut être relancé sans risque.

Vérifier ensuite : `curl -I http://194.164.76.69` et
`curl http://194.164.76.69/api/health`.

## Installation initiale d'un nouveau serveur

Prérequis : docker + docker compose, nginx, rsync.

```bash
# 1. Cloner les repos (chemins par défaut attendus par deploy.sh)
git clone git@github.com:mattdeba/eta_planning.git /home/eta_planning
git clone git@github.com:mattdeba/eta_planning_frontend.git /home/eta_planning_frontend

# 2. Préparer /opt
mkdir -p /opt/my_eta_planning/backend /opt/my_eta_planning/frontend
cp /home/eta_planning/deploy/deploy.sh /opt/my_eta_planning/deploy.sh
chmod +x /opt/my_eta_planning/deploy.sh

# 3. Secrets de production
cp /home/eta_planning/.env.production.example /opt/my_eta_planning/backend/.env.production
#   → éditer : mots de passe DB et secrets JWT (chaînes longues et aléatoires)

# 4. nginx
cp /home/eta_planning/deploy/nginx-my_eta_planning.conf /etc/nginx/sites-available/my_eta_planning
ln -s /etc/nginx/sites-available/my_eta_planning /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default   # si un site default occupe déjà le port 80
nginx -t && systemctl reload nginx

# 5. Premier déploiement (inclut le seed initial de la base)
/opt/my_eta_planning/deploy.sh
```

Le seed crée le compte administrateur initial ; conserver ses identifiants
dans `/opt/my_eta_planning/admin-credentials.txt` (hors git).

## Commandes utiles

```bash
docker ps                                          # état des conteneurs
docker logs -f my_eta_planning_api                 # logs backend
docker logs -f my_eta_planning_frontend            # logs frontend
docker exec my_eta_planning_postgres \
  pg_dump -U eta eta_planning > backup.sql         # sauvegarde BDD
```

Rollback : `git checkout <commit>` dans le(s) repo(s) concerné(s), puis
relancer `/opt/my_eta_planning/deploy.sh`.

## Limites connues et évolutions possibles

- **HTTP uniquement.** HTTPS via Let's Encrypt exige un nom de domaine
  (pas de certificat sur une IP nue). Avec un domaine : `certbot --nginx`.
- Le build se fait sur le serveur (simple, aucun registry). Si le serveur
  manque de RAM/CPU, builder ailleurs et pousser les images sur un registry.

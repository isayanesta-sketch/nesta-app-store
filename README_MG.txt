NESTA APP STORE COMPLETE — V2
==============================

Ity dia projet serveur feno kokoa, vonona hapetraka amin'ny serveur Node.js na Docker.
Tsy mbola online izy ary tsy APK Android voa-compile.

FONOSANA:
- Pejy fandraisana sy fikarohana APK
- Sokajy application
- Download avy amin'ny serveur-nao
- Admin: upload, lisitra, famafana
- Fanisana téléchargements
- Limite upload, mot de passe admin, rate limit
- Dockerfile sy docker-compose

FOMBA ANDRAMANA AMIN'NY WINDOWS 10:
1. Apetraho Node.js LTS: https://nodejs.org/
2. Sokafy ity dossier ity.
3. Sokafy CMD ao anatiny.
4. Alefaso: npm install
5. Adikao .env.example ho .env
6. Ovay ao amin'ny .env ny ADMIN_PASSWORD ho mot de passe lava sy manokana.
7. Alefaso: npm start
8. Sokafy:
   http://localhost:3000
   http://localhost:3000/admin.html

FOMBA APETRAKA ONLINE:
Safidio hébergeur manohana Node.js na Docker.
- Install/build: npm install
- Start: npm start
- Environment: ADMIN_PASSWORD, PORT, MAX_UPLOAD_MB
- Ampifandraiso amin'ny persistent disk/volume ny /app/uploads sy /app/data.
- Ampiasao HTTPS.
- Manaova backup matetika.

DOCKER:
1. Apetraho Docker Desktop.
2. Adikao .env.example ho .env ary ovay ADMIN_PASSWORD.
3. Ao amin'ny CMD: docker compose up -d --build
4. Sokafy http://localhost:3000

FEPETRA LEHIBE:
- Mila kaonty hébergement/serveur ianao vao afaka miditra amin'ny Internet ny besinimaro.
- Mila domaine raha tiana ho mora tadidy ny adiresy (tsy voatery).
- Mila persistent storage; raha tsy izany dia mety ho very ny APK sy database rehefa soloina ny container.
- Ity version ity tsy manao antivirus scan, APK signature verification, na moderation automatique.
- APK anao na nahazoanao alalana hizara ihany no ampidiro.
- Aza mizara ny mot de passe admin.
- Alohan'ny hanokafana ho an'ny besinimaro dia tsara ny manampy antivirus scanning, backup, monitoring ary HTTPS reverse proxy.

MOMBA NY APK ANDROID:
Ny NESTA APP STORE amin'izao dia tranonkala responsive/PWA azo sokafana amin'ny Android ary azo atao "Add to Home Screen".
Raha APK Android tena izy no ilaina, mbola mila Android wrapper/WebView, Android SDK, signing key ary build/test misaraka.

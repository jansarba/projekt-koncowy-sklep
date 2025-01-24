# projekt końcowy - WDAI

## Opis

Projekt wykonany jest w postaci sklepu z podkładami muzycznymi. Składa się on z:
 - backendu wykorzystującego Express.js,
 - frontendu zbudowanego z Vite + React + TypeScript,
 - bazy danych PostgreSQL.

Dodatkowo, korzystam z:

 - [Tailwind CSS](https://tailwindcss.com/),
 - [wavesurfer](https://github.com/katspaugh/wavesurfer.js),
 - [HeadlessUI](https://headlessui.com/).

Na chwilę obecną, hostingi z jakich osobiście korzystam, to darmowe wersje:
 - [AWS S3](https://aws.amazon.com/s3/) (bucket),
 - [Render](https://render.com/) (baza danych, backend, domena).

Funkcjonalności znaleźć można w [wymaganiach](Projekt.pdf). Mój projekt spełnia wszystkie

## Setup

Aby otworzyć stronę lokalnie, wystarczy w folderze bazowym wpisać następujące komendy:
```
cd vite-project
npm i
npm run dev
```
Następnie, w nowej instancji terminala:
```
cd vite-project/backend
npm i 
npm run startdev
```
Komenda startdev pozwala na automatyczny restart serwera w razie zmian w pliku server.js.

Aby połączyć się z bazą danych oraz bucketem, należy zapewnić swoje dane w nowym pliku vite-project/.env, na przykład:
```
PORT=2137
VITE_API_BASE_URL=http://localhost:2137
DB_USER=[nazwa uzytkownika]
DB_HOST=[link do hosta bazy danych]
DB_NAME=[nazwa bazy danych]
DB_PASSWORD=[haslo do bazy danych]
DB_PORT=[port bazy danych]

VITE_AWS_ACCESS_KEY_ID=[klucz aws]
VITE_AWS_SECRET_ACCESS_KEY=[sekretny klucz aws]
VITE_AWS_BUCKET_NAME=[nazwa bucketa]
VITE_AWS_REGION=[region bucketa]

JWT_SECRET=jakis-sekretny-jwt
```

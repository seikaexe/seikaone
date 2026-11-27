# SeikaOne (Full-Stack Clone of ZyroStore)

Express.js backend + static frontend, deployable to Vercel.

## Run locally
```
npm install
cp .env.example .env
npm start
```
Open http://localhost:3000

## Google OAuth setup (Vercel)
1. Google Cloud Console → APIs & Services → Credentials → Create OAuth client ID (Web application).
2. Authorized JavaScript origins:
   - http://localhost:3000
   - https://seikaone.vercel.app
3. Authorized redirect URIs:
   - http://localhost:3000/login
   - https://seikaone.vercel.app/login
4. Vercel Dashboard → Project → Settings → Environment Variables → add:
   - `GOOGLE_CLIENT_ID` = <client id>
   - `GOOGLE_CLIENT_SECRET` = <client secret>
5. Redeploy (Vercel → Deployments → Redeploy).

## Deploy
```
npm i -g vercel
vercel --prod
```

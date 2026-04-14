# Backend Deployment

This repo includes a Render Blueprint in [render.yaml](/c:/Users/dell/Downloads/OSINT-Explorer/OSINT-Explorer/render.yaml) that provisions:

- a Node web service for `artifacts/api-server`
- a Postgres database for search history and dashboard data

## 1. Deploy the backend on Render

1. Open `https://dashboard.render.com/blueprints`
2. Click `New Blueprint Instance`
3. Connect the GitHub repo `guriamloh-os/OSINT_Tool`
4. Render should detect [render.yaml](/c:/Users/dell/Downloads/OSINT-Explorer/OSINT-Explorer/render.yaml)
5. Create the resources

Render will create:

- `osint-tool-api`
- `osint-tool-db`

The backend health endpoint will be:

- `https://<your-render-service>.onrender.com/api/healthz`

## 2. Connect Netlify frontend to the backend

In Netlify for the frontend site:

1. Go to `Site configuration` -> `Environment variables`
2. Add:
   - `VITE_API_BASE_URL` = `https://<your-render-service>.onrender.com`
3. Trigger a redeploy of the Netlify site

## 3. Expected result

- The dashboard loads without crashing
- Username, email, domain, IP, phone, metadata, reports, history, and AI routes call the hosted backend
- Search history persists in Render Postgres

## Notes

- The frontend is still hosted on Netlify
- The backend is hosted separately on Render
- CORS is already enabled in the API server, so cross-origin browser requests from Netlify are allowed

# Deploying API to Render and Frontend to Netlify

This file contains PowerShell-friendly, copy-pasteable steps to deploy the API (server/) to Render and the frontend (frontend/) to Netlify.

Pre-reqs
- A GitHub repo (create one and push this project). We'll assume the remote is named `origin` and the main branch is `main`.
- Identity is configured in `server/src/bfhl/bfhl.service.ts`.

1) Prepare the repo (PowerShell)

```powershell
cd C:\Users\krith\Desktop\new\files
git init
git add .
git commit -m "Init bfhl project"
git branch -M main
# Replace <your-remote-url> with your GitHub repo URL
git remote add origin <your-remote-url>
git push -u origin main
```

2) Deploy API to Render (Git-based)

 - Go to https://render.com and create a new Web Service.
 - Connect your GitHub account and pick the repository/branch you pushed.
 - Set the "Root Directory" to `server` (or use `render.yaml`).
 - Set the Build Command to `npm install && npm run build`.
 - Set the Start Command to `npm start`.
 - Set any environment variables if you want; otherwise Render will use the defaults.
 - Deploy and note the public URL (e.g. `https://bfhl-api.onrender.com`).

3) Deploy Frontend to Netlify (Git-based)

 - Go to https://app.netlify.com and create a new site from Git.
 - Connect GitHub and choose your repo/branch.
 - For build settings: since this is a static SPA, set the publish directory to `frontend` and leave build command blank.
 - Deploy the site and note the Netlify URL.

4) Point the frontend to the API

 - Open the deployed frontend in Netlify.
 - The "API Base URL" field no longer defaults to `http://localhost:3000` after deployment.
 - The deployed frontend defaults to this Render API URL:

```text
https://bfhl-node-hierarchy-explorer-0swc.onrender.com
```

 - If you create a new Render service later, update the "API Base URL" field to the new Render API URL.
 - The URL is automatically saved in your browser's localStorage for future visits.
 - You can also share a preconfigured link by adding the API URL as a query parameter:

```text
https://your-netlify-site.netlify.app/?api=https://bfhl-node-hierarchy-explorer-0swc.onrender.com
```

 - If the frontend and backend are deployed under the same domain, the frontend will automatically use that same origin.

Troubleshooting
- If CORS errors occur, ensure Nest CORS remains enabled in `server/src/main.ts`.
- If the API returns 404, check Render logs to ensure the server started and `PORT` is honored.

If you want, I can:
- Create two separate repositories (one for server and one for frontend) instead of mono-repo flow.
- Copy the full working `index.html` into `frontend/index.html` (I created a placeholder).
- Create GitHub Actions to automate deployments.

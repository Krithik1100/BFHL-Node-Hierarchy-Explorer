# Deploying API to Render and Frontend to Netlify

This file contains PowerShell-friendly, copy-pasteable steps to deploy the API (server/) to Render and the frontend (frontend/) to Netlify.

Pre-reqs
- A GitHub repo (create one and push this project). We'll assume the remote is named `origin` and the main branch is `main`.
- Replace identity placeholders in `server/index.js` if needed (USER_ID, EMAIL_ID, COLLEGE_ROLL_NUMBER).

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
 - Set the "Root Directory" to `server` (or use the `render.yaml` root field).
 - Set the Start Command to `npm start`.
 - Set any environment variables if you want; otherwise Render will use the defaults.
 - Deploy and note the public URL (e.g. `https://bfhl-api.onrender.com`).

3) Deploy Frontend to Netlify (Git-based)

 - Go to https://app.netlify.com and create a new site from Git.
 - Connect GitHub and choose your repo/branch.
 - For build settings: since this is a static SPA, set the publish directory to `frontend` and leave build command blank.
 - Deploy the site and note the Netlify URL.

4) Point the frontend to the API

 - Open the deployed frontend in Netlify and update the "API Base URL" field to your Render API URL (e.g. `https://bfhl-api.onrender.com`).

Troubleshooting
- If CORS errors occur, ensure `cors` is enabled (server/index.js already uses it).
- If the API returns 404, check Render logs to ensure the server started and `PORT` is honored.

If you want, I can:
- Create two separate repositories (one for server and one for frontend) instead of mono-repo flow.
- Copy the full working `index.html` into `frontend/index.html` (I created a placeholder).
- Create GitHub Actions to automate deployments.

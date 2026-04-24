# BFHL Node Hierarchy Explorer

This project is a small full-stack solution for the BFHL challenge. It takes a list of directed edges like `A->B`, validates them, builds hierarchy groups, detects cycles, reports duplicate or invalid entries, and shows the result in a simple browser UI.

The backend is built with NestJS and exposes a `POST /bfhl` API. The frontend is a static HTML page that calls the API and renders the response in a readable way.

## Project Structure

```text
bfhl-project/
|-- server/
|   |-- src/
|   |   |-- app.module.ts
|   |   `-- bfhl/
|   |       |-- bfhl.controller.ts
|   |       |-- bfhl.module.ts
|   |       `-- bfhl.service.ts
|   |-- package.json
|   `-- tsconfig.json
|-- frontend/
|   `-- index.html
|-- render.yaml
|-- netlify.toml
`-- DEPLOY.md
```

## Identity Used

The API response includes the required student details:

```ts
user_id: "krithik_kumar_26012006"
email_id: "krithikkumar2006@gmail.com"
college_roll_number: "RA2311026020062"
```

These values are configured in:

```text
server/src/bfhl/bfhl.service.ts
```

## Run Locally

Install and start the backend:

```bash
cd server
npm install
npm run build
npm start
```

The backend runs at:

```text
http://localhost:3000
```

Open the frontend:

```text
frontend/index.html
```

The API Base URL field should be:

```text
http://localhost:3000
```

## API

### Health Check

```http
GET /
```

Example response:

```json
{
  "status": "ok",
  "service": "bfhl-backend"
}
```

### Process Edges

```http
POST /bfhl
```

Request body:

```json
{
  "data": ["A->B", "A->C", "B->D", "A->B", "hello"]
}
```

Example response:

```json
{
  "is_success": true,
  "user_id": "krithik_kumar_26012006",
  "email_id": "krithikkumar2006@gmail.com",
  "college_roll_number": "RA2311026020062",
  "invalid_entries": ["hello"],
  "duplicate_edges": ["A->B"],
  "hierarchies": [
    {
      "root": "A",
      "tree": {
        "A": {
          "B": {
            "D": {}
          },
          "C": {}
        }
      },
      "depth": 3
    }
  ],
  "summary": {
    "total_trees": 1,
    "total_cycles": 0,
    "largest_tree_root": "A"
  }
}
```

## What It Handles

- Validates edge format as `X->Y`, where both nodes are single uppercase letters.
- Rejects invalid values like `hello`, `1->2`, `A->`, and self-loops like `A->A`.
- Tracks duplicate edges while keeping the first occurrence.
- Builds separate hierarchy groups when the input has disconnected graphs.
- Handles multi-parent cases by keeping the first parent found for a child.
- Detects cycles and marks cyclic groups instead of forcing them into a tree.
- Calculates tree depth and reports the deepest root in the summary.
- Enables CORS so the static frontend can call the backend.

## Deployment

The repo includes:

- `render.yaml` for deploying the NestJS backend on Render.
- `netlify.toml` for deploying the static frontend on Netlify.

Render should use:

```text
Root Directory: server
Build Command: npm install && npm run build
Start Command: npm start
```

Netlify should publish:

```text
frontend
```

After deployment, update the frontend's API Base URL field to the deployed backend URL.

# SkinCancerDetection

A web application for uploading a skin-lesion image and viewing classification results returned by an image-analysis service. The app includes a responsive upload and results flow, confidence scores, and recent analysis history saved in the current browser.

> **Medical disclaimer:** This project is for informational and educational use only. It is not a medical device and cannot diagnose skin cancer. Model output is not medical advice and must not replace evaluation by a qualified healthcare professional. Consult a clinician about any skin concern.

## Features

- Upload or drag and drop a JPG, PNG, or WebP image (up to 10 MB).
- Preview the selected image before submitting it for analysis.
- Display classification labels and model confidence scores.
- Review up to 20 recent analyses saved in browser local storage.
- Upload images to Supabase Storage and request predictions from the Hugging Face Inference API through the backend.
- Show actionable errors when the API cannot be reached or returns an unusable response.

Analysis history is stored only in the browser that created it; it is not synchronized between devices or saved in the database.

## Architecture

```text
Browser
  React + TypeScript + Vite
       │ POST /analyze (multipart image)
       ▼
  FastAPI backend
       ├── Supabase Storage (uploaded image)
       └── Hugging Face Inference API (classification)
```

## Technology

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Frontend hosting:** Vercel
- **Backend:** Python, FastAPI, SQLAlchemy, hosted on Render
- **Database:** Neon Postgres
- **Image storage:** Supabase Storage
- **Image analysis:** Hugging Face Inference API

## Live deployment

The application is deployed at **[skin-cancer-detection-opal.vercel.app](https://skin-cancer-detection-opal.vercel.app/)**.

| Service | Provider | Purpose |
|---|---|---|
| Frontend | Vercel | Hosts the web application |
| Backend API | Render | Runs the FastAPI service |
| Database | Neon | Provides the Postgres database |
| Image storage | Supabase | Stores uploaded images |
| Image analysis | Hugging Face | Returns classification results |

Render deployment configuration is maintained in `backend/render.yaml`. Analysis history currently remains in the user's browser; analysis records are not yet persisted to Neon.

## Run locally

### Prerequisites

- Python 3.10 or later
- Node.js and npm
- Supabase project with a `skin-images` storage bucket
- Hugging Face inference endpoint and access token

### Backend

Create `backend/.env` with the configuration values below. Keep this file and all credentials private.

```dotenv
HF_API_URL=https://your-inference-endpoint
HF_TOKEN=your-hugging-face-token
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-key
DATABASE_URL=your-database-connection-string
```

The database connection is initialized by the backend, but analysis records are not currently written to it. The frontend stores recent history locally instead.

Install dependencies and start the API:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```

The API is available at `http://localhost:8000`; its health endpoint is `GET /`.

### Frontend

Optionally create `frontend/.env.local` to point the app to a non-default API URL:

```dotenv
VITE_API_URL=http://localhost:8000
```

Install dependencies and start the development server:

```powershell
cd frontend
npm ci
npm run dev
```

Open the local URL printed by Vite. To create a production build, run `npm run build`; run `npm run lint` to check the frontend.

## API

### `POST /analyze`

Accepts a multipart form upload with a `file` field. On success, the response includes the uploaded image URL and the inference result:

```json
{
  "status": "success",
  "image_url": "https://...",
  "analysis": [
    { "label": "example_class", "score": 0.92 }
  ]
}
```

The frontend accepts predictions returned as an array or under a `predictions` or `results` property, with each prediction containing a string `label` and numeric `score` (or `confidence`).

## Current limitations

- Results and history are informational; there is no medical review or diagnosis.
- Analysis history is browser-local and limited to the latest 20 results.
- Database sessions are configured, but analysis records are not persisted to the database.
- The backend currently accepts uploaded file content without server-side type or size validation; client-side limits are not a security boundary.
- Verify the Hugging Face authorization configuration in `backend/app/ai.py` before deployment: the token is loaded from the environment, but the outgoing request currently uses a placeholder authorization value.
- Configure and verify the Supabase bucket's access policy for the intended deployment.

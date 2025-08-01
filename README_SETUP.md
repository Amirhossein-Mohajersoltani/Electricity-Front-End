# Project Environment Setup

This document provides instructions for setting up the development and production environments for the Electricity Dashboard application.

## Quick Setup

The `setup_env.py` script is designed to automate the creation of `.env` files for both the frontend and backend. It ensures that the correct settings are applied based on the environment you choose.

### 1. Local Development Setup

To configure the project for local development, run the following command from the project root:

```bash
python3 setup_env.py --env local
```

This will create two files:
- `backend/.env`: Configures the Flask server for development, with debugging enabled and local database connections.
- `frontend/.env`: Configures the Vite frontend to send API requests to your local backend (`http://localhost:5000/api`).

After setting up the environment, you can start the application:
- **Start Backend:** `cd backend && python3 main.py`
- **Start Frontend:** `cd frontend && npm install && npm run dev`

### 2. Server (Production) Setup

To configure the project for a production server, run this command:

```bash
python3 setup_env.py --env server
```

This will generate `.env` files with production-safe settings:
- `backend/.env`: Configures the Flask server for production, with debugging disabled and a unique, secure `SECRET_KEY`.
- `frontend/.env`: Configures the frontend to use the public-facing server API URL.

#### Production Deployment Steps

1.  **Build the Frontend:** Create an optimized static build of the frontend:
    ```bash
    cd frontend
    npm install
    npm run build
    ```

2.  **Run the Backend:** Start the Flask application on the server, preferably using a production-grade WSGI server like Gunicorn or uWSGI.

3.  **Configure a Reverse Proxy (Nginx):**
    It is highly recommended to use a reverse proxy like Nginx to manage incoming traffic. A typical Nginx configuration would:
    - Serve the static frontend assets from the `frontend/dist` directory.
    - Forward all requests to `/api` to the backend Flask application running on `127.0.0.1:5000`.
    - Handle SSL termination to serve the application over HTTPS.

---

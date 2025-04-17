# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

## Development Setup

### Using Docker

The project includes a Docker setup for development. To run the application in development mode:

1. Build the Docker image:
```bash
docker build -t frontend-dev .
```

2. Run the container:
```bash
docker run -p 5173:5173 frontend-dev
```

The development server will be available at `http://localhost:5173`. Changes to your code will automatically trigger hot reloading.

### Local Development

Alternatively, you can run the project locally:

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The development server will be available at `http://localhost:5173` (default Vite port).

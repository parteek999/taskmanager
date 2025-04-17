# Backend Assessment

This is the backend service for the assessment project, built with Node.js, Express, and TypeScript.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn
- Docker and Docker Compose (for containerized deployment)

## Setup

### Local Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/assessment
   JWT_SECRET=your-secret-key
   ```

4. Set up the database:
   ```bash
   # Create the database
   createdb assessment
   
   # Run migrations
   npm run migrate
   # or
   yarn migrate
   ```

### Docker Setup

1. Make sure Docker and Docker Compose are installed on your system
2. Build and start the containers:
   ```bash
   docker-compose up --build
   ```
3. To run in detached mode:
   ```bash
   docker-compose up -d
   ```
4. To stop the containers:
   ```bash
   docker-compose down
   ```

## Development

To start the development server with hot-reload:

```bash
npm run dev
# or
yarn dev
```

## Building

To build the project:

```bash
npm run build
# or
yarn build
```

## Running in Production

To run the production build:

```bash
npm start
# or
yarn start
```

## Testing

To run tests:

```bash
npm test
# or
yarn test
```

## API Documentation

The API documentation is available at `/api-docs` when running the server.

## License

MIT 
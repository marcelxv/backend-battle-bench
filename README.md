# API Benchmark - Frontend

Next.js frontend application for the API benchmark project.

## Features

- Modern Next.js 14 with App Router
- TypeScript support
- Tailwind CSS for styling
- Victory charts for data visualization
- Responsive design

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build

```bash
npm run build
npm start
```

## Railway Deployment

This project is configured for Railway deployment with:

- Dockerfile for containerized deployment
- Standalone output for optimized builds
- Railway.json configuration

### Deploy to Railway

1. Connect your GitHub repository to Railway
2. Railway will automatically detect the Dockerfile
3. Set environment variables if needed
4. Deploy!

## Project Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
└── components/
    └── (your components)
```

## Environment Variables

Create a `.env.local` file for local development:

```
# Add your environment variables here
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

# Railway Deployment Guide

This guide explains how to deploy each component of the API Benchmark project individually on Railway.

## Prerequisites

1. GitHub account with the separated repositories
2. Railway account (sign up at [railway.app](https://railway.app))
3. Each repository should be public or Railway should have access

## Repository Structure

After separation, you should have three repositories:

- `api-benchmark-frontend` - Next.js frontend application
- `api-benchmark-ts-api` - TypeScript Express.js API
- `api-benchmark-rust-api` - Rust Axum API

## Deployment Steps

### 1. Frontend Deployment

1. **Create New Project in Railway**
   - Go to Railway dashboard
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `api-benchmark-frontend`

2. **Configuration**
   - Railway will auto-detect the Dockerfile
   - No additional environment variables needed for basic setup
   - Default port: 3000

3. **Custom Domain (Optional)**
   - Go to project settings
   - Add custom domain if desired

### 2. TypeScript API Deployment

1. **Create New Project in Railway**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `api-benchmark-ts-api`

2. **Environment Variables**
   ```
   PORT=8080
   NODE_ENV=production
   ```

3. **Verification**
   - Check `/health` endpoint after deployment
   - Test API endpoints

### 3. Rust API Deployment

1. **Create New Project in Railway**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `api-benchmark-rust-api`

2. **Environment Variables**
   ```
   PORT=8081
   RUST_LOG=info
   ```

3. **Build Configuration**
   - Railway will use the Dockerfile
   - Rust compilation may take 5-10 minutes
   - Release build is optimized for performance

## Inter-Service Communication

If your services need to communicate:

1. **Get Service URLs**
   - Each Railway service gets a unique URL
   - Format: `https://[service-name]-production.up.railway.app`

2. **Update Frontend Configuration**
   - Update API endpoints in frontend to point to deployed APIs
   - Use environment variables for API URLs

3. **CORS Configuration**
   - Ensure APIs allow requests from frontend domain
   - Update CORS settings in both TypeScript and Rust APIs

## Environment Variables for Frontend

Add these to your frontend Railway project:

```
NEXT_PUBLIC_TS_API_URL=https://your-ts-api-production.up.railway.app
NEXT_PUBLIC_RUST_API_URL=https://your-rust-api-production.up.railway.app
```

## Monitoring and Logs

1. **Railway Dashboard**
   - View deployment logs
   - Monitor resource usage
   - Check service health

2. **Custom Monitoring**
   - Add health check endpoints
   - Implement logging in your applications
   - Use Railway metrics

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Dockerfile syntax
   - Verify all dependencies are included
   - Review build logs in Railway

2. **Port Issues**
   - Ensure PORT environment variable is set
   - Check that application listens on correct port
   - Railway assigns random ports if not specified

3. **CORS Errors**
   - Update CORS configuration in APIs
   - Add frontend domain to allowed origins
   - Check preflight request handling

### Getting Help

- Railway Documentation: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- GitHub Issues: Create issues in respective repositories

## Cost Optimization

1. **Resource Limits**
   - Set appropriate CPU/memory limits
   - Use Railway's usage-based pricing

2. **Sleep Mode**
   - Enable sleep for development environments
   - Keep production services always active

3. **Monitoring Usage**
   - Check Railway dashboard for usage metrics
   - Optimize based on actual traffic patterns

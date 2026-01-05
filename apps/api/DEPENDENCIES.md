{
  "name": "@morinalight/api",
  "version": "1.0.0",
  "description": "API Backend for MorinaLight",
  "main": "dist/main.js",
  "scripts": {
    "dev": "tsx watch src/main.ts",
    "build": "tsc",
    "start": "node dist/main.js",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  },
  "dependencies": {
    "@fastify/cors": "^9.0.1",
    "@fastify/helmet": "^11.1.1",
    "@fastify/jwt": "^8.0.0",
    "@fastify/multipart": "^8.1.0",
    "@nestjs/common": "^10.3.0",
    "@nestjs/core": "^10.3.0",
    "@nestjs/schedule": "^4.0.0",
    "@prisma/client": "^5.9.0",
    "@slack/webhook": "^7.0.2",
    "bcryptjs": "^2.4.3",
    "fastify": "^4.29.1",
    "fastify-type-provider-zod": "^2.0.0",
    "nodemailer": "^6.9.8",
    "pdfkit": "^0.15.0",
    "recharts": "^2.10.4",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^20.11.0",
    "@types/nodemailer": "^6.4.14",
    "@types/pdfkit": "^0.13.4",
    "@vitest/ui": "^1.2.0",
    "prisma": "^5.9.0",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3",
    "vitest": "^1.2.0"
  }
}

# API Documentation with Swagger

This directory contains the Swagger configuration for the Pixel Art API documentation.

## Files

- `swagger.config.ts`: Configuration for the Swagger documentation, including API metadata, security schemes, and file paths to scan for annotations.
- `swagger.middleware.ts`: Express middleware setup for serving the Swagger UI and JSON spec.

## Usage

The Swagger UI is automatically available at `/api-docs` when the server is running.

## Adding Documentation

Documentation is added using JSDoc-style comments with Swagger annotations. Example:

```typescript
/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get authenticated user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
```

## Best Practices

1. Group endpoints by tags for better organization
2. Include request/response examples
3. Document all possible response status codes
4. Use schema references for consistent type definitions
5. Include security requirements for protected endpoints
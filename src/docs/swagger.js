export const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'AdoptMe API',
            version: '1.0.0',
            description: 'API REST de adopción de mascotas — Trabajo Final Backend III'
        },
        servers: [
            { url: 'http://localhost:8080', description: 'Servidor local' }
        ],
        components: {
            schemas: {
                Adoption: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '60d5ec49f1b2c72b3c8d4e5f' },
                        owner: { type: 'string', example: '60d5ec49f1b2c72b3c8d4e5a' },
                        pet: { type: 'string', example: '60d5ec49f1b2c72b3c8d4e5b' }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'error' },
                        error: { type: 'string', example: 'Mensaje de error' }
                    }
                },
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'success' },
                        payload: { type: 'object' }
                    }
                }
            }
        }
    },
    apis: ['./src/routes/*.js']
};

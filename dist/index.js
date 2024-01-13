"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const client_1 = require("@prisma/client");
const sharp_1 = __importDefault(require("sharp"));
const app = (0, fastify_1.default)({ logger: true });
const prisma = new client_1.PrismaClient();
// Register fastify-cors plugin
app.register(cors_1.default, {
// Add your cors options here if needed
});
// Enum for HTTP Status Codes
var HttpStatus;
(function (HttpStatus) {
    HttpStatus[HttpStatus["NotFound"] = 404] = "NotFound";
    HttpStatus[HttpStatus["InternalServerError"] = 500] = "InternalServerError";
})(HttpStatus || (HttpStatus = {}));
app.get('/', async (request, reply) => {
    try {
        const count = await prisma.category.count();
        const welcomeMessage = `Welcome to Fastify API! Total number of categories: ${count}`;
        reply.send({ message: welcomeMessage });
    }
    catch (error) {
        console.error('Error fetching category count:', error);
        reply.status(HttpStatus.InternalServerError).send({ error: 'Internal Server Error' });
    }
});
// Get all categories
app.get('/categories', async () => {
    const categories = await prisma.category.findMany({
        select: {
            id: true,
            name: true,
            picture: true,
            parent_id: true,
            created_at: true,
            // other fields if you need
        },
    });
    return categories;
});
// Get category by id
app.get('/categories/:id', async (request, reply) => {
    try {
        const params = request.params;
        const categoryId = parseInt(params.id, 10);
        const category = await prisma.category.findUnique({
            where: { id: categoryId },
        });
        if (!category) {
            reply.status(HttpStatus.NotFound).send({ error: 'Category not found' });
            return;
        }
        reply.send(category);
    }
    catch (error) {
        console.error('Error fetching category:', error);
        const errorMessage = typeof error === 'string' ? error : (error.message || 'Unknown error');
        reply.status(HttpStatus.InternalServerError).send({
            error: 'Internal Server Error',
            details: errorMessage, // Include the error message for debugging
        });
    }
});
// Create category with image resizing
app.post('/categories', async (request) => {
    const { picture, ...categoryData } = request.body || {};
    let resizedPicture;
    if (picture) {
        // Resize image to 3200x3200 pixels
        const resizedBuffer = await (0, sharp_1.default)(Buffer.from(picture, 'base64'))
            .resize(3200, 3200)
            .toBuffer();
        resizedPicture = resizedBuffer.toString('base64');
    }
    // Ensure productsCount is either a number or null
    const newCategoryData = {
        ...categoryData,
        picture: resizedPicture || null,
        productsCount: categoryData.productsCount !== undefined ? categoryData.productsCount : null,
    };
    const newCategory = await prisma.category.create({
        data: newCategoryData,
    });
    return newCategory;
});
// Update category by id
app.put('/categories/:id', async (request, reply) => {
    try {
        const params = request.params;
        const categoryId = parseInt(params.id, 10);
        const { id, parent_id, ...rest } = request.body ?? {};
        const updatedCategory = await prisma.category.update({
            where: { id: categoryId },
            data: {
                ...rest, // Omit 'id' and 'parent_id'
                parent: request.body?.parent !== undefined
                    ? { connect: { id: (request.body?.parent).id } }
                    : undefined,
                parent_id: request.body?.parent_id,
            }, // Explicitly specify the type
        });
        if (!updatedCategory) {
            reply.status(HttpStatus.NotFound).send({ error: 'Category not found' });
            return;
        }
        reply.send(updatedCategory);
    }
    catch (error) {
        console.error('Error updating category:', error);
        reply.status(HttpStatus.InternalServerError).send({ error: 'Failed to update category' });
    }
});
// Delete category by id
app.delete('/categories/:id', async (request, reply) => {
    try {
        const params = request.params;
        const categoryId = parseInt(params.id, 10);
        // Check if the category exists before attempting to delete
        const existingCategory = await prisma.category.findUnique({
            where: { id: categoryId },
        });
        if (!existingCategory) {
            reply.code(HttpStatus.NotFound).send({ error: 'Category not found' });
            return;
        }
        const deletedCategory = await prisma.category.delete({
            where: { id: categoryId },
        });
        reply.send(deletedCategory);
    }
    catch (error) {
        console.error(error);
        reply.code(HttpStatus.InternalServerError).send({ error: 'Internal Server Error' });
    }
});
// Run the server
const start = async () => {
    try {
        await app.listen(3000);
        console.log('Server is running on http://localhost:3000');
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
};
start();

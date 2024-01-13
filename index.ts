import fastify, { FastifyInstance } from 'fastify';
import fastifyCors from '@fastify/cors';
import { PrismaClient, Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as stream from 'stream';
import gm from 'gm';

const app: FastifyInstance = fastify({ logger: true });
const prisma = new PrismaClient();

// Register fastify-cors plugin
app.register(fastifyCors, {
    // Add your cors options here if needed
  });

// Enum for HTTP Status Codes
enum HttpStatus {
  NotFound = 404,
  InternalServerError = 500,
}

// Product and Category interfaces
interface Product {
  id: number;
  name: string;
  picture: string;
  category_id: number;
  created_at: Date;
  updated_at: Date;
}

interface Category {
    id: number;
    name: string;
    picture?: string | null;
    parent_id?: number | null;
    created_at: Date;
    updated_at: Date;
    products: Product[];
    children: Category[];
    parent?: Category | null;
    productsCount?: number | null;
  }
  
  app.get('/', async (request, reply) => {
    try {
        const categoryCount = await prisma.category.count();
        const productCount = await prisma.product.count();

        const welcomeMessage = {
            message: 'Welcome to Fastify API!',
            counts: {
                categories: { count: categoryCount },
                products: { count: productCount },
            },
        };

        reply.send(welcomeMessage);
    } catch (error) {
        console.error('Error fetching counts:', error);
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
        const params = request.params as { id: string };
        const categoryId = parseInt(params.id, 10);

        const category = await prisma.category.findUnique({
            where: { id: categoryId },
        });

        if (!category) {
            reply.status(HttpStatus.NotFound).send({ error: 'Category not found' });
            return;
        }

        reply.send(category);
    } catch (error: any) {
        console.error('Error fetching category:', error);

        const errorMessage = typeof error === 'string' ? error : (error.message || 'Unknown error');

        reply.status(HttpStatus.InternalServerError).send({
            error: 'Internal Server Error',
            details: errorMessage, // Include the error message for debugging
        });
    }
});
// Create category
app.post<{ Body: Category }>('/categories', async (request) => {
  const { parent, name, ...categoryData } = request.body || {};

  // Ensure productsCount is either a number or null
  const newCategoryData = {
    ...categoryData,
    name, // Make sure 'name' is included
    productsCount: categoryData.productsCount !== undefined ? categoryData.productsCount : null,
  };

  console.log('New Category Data:', newCategoryData);

  try {
    const newCategory = await prisma.category.create({
      data: newCategoryData as Prisma.CategoryCreateInput,
    });

    return newCategory;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error; // Rethrow the error to be caught by the error handler
  }
});
// Update category by id
app.put<{ Params: { id: string }, Body: Category }>('/categories/:id', async (request, reply) => {
    try {
      const params = request.params;
      const categoryId = parseInt(params.id, 10);
  
      const { id, parent_id, ...rest } = request.body ?? {};
  
      const updatedCategory = await prisma.category.update({
        where: { id: categoryId },
        data: {
          ...rest, // Omit 'id' and 'parent_id'
          parent: request.body?.parent !== undefined
            ? { connect: { id: (request.body?.parent as Category).id } }
            : undefined,
          parent_id: request.body?.parent_id as number | null,
        } as Prisma.CategoryUpdateInput, // Explicitly specify the type
  
      });
  
      if (!updatedCategory) {
        reply.status(HttpStatus.NotFound).send({ error: 'Category not found' });
        return;
      }
  
      reply.send(updatedCategory);
    } catch (error) {
      console.error('Error updating category:', error);
      reply.status(HttpStatus.InternalServerError).send({ error: 'Failed to update category' });
    }
  });
// Delete category by id
app.delete('/categories/:id', async (request, reply) => {
    try {
      const params = request.params as { id: string };
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
    } catch (error) {
      console.error(error);
      reply.code(HttpStatus.InternalServerError).send({ error: 'Internal Server Error' });
    }
  });


// Endpoint to handle image upload and resizing
app.post<{ Body: { picture: string; category_id: number } }>('/upload', async (request, reply) => {
  try {
    const { picture, category_id } = request.body;

    // Replace 'your_image_directory' with the actual path to your image directory
    const imageDirectory = path.join(__dirname, 'your_image_directory');

    // Base64 to buffer
    const buffer = Buffer.from(picture, 'base64');

    // Save the original image
    const originalImagePath = path.join(imageDirectory, `${category_id}_original.jpg`);
    fs.writeFileSync(originalImagePath, buffer);

    // Resize the image
    const resizedImagePath = path.join(imageDirectory, `${category_id}_resized.jpg`);
    const resizeStream = new stream.PassThrough(); 
    
    // Set the desired dimensions (3200x3200)
    gm(buffer).resize(3200, 3200).stream().pipe(resizeStream);

    const resizedBuffer = await streamToBuffer(resizeStream);
    fs.writeFileSync(resizedImagePath, resizedBuffer);

    reply.send({ message: 'Image uploaded and resized successfully.' });
  } catch (error) {
    console.error('Error handling image upload:', error);
    reply.status(HttpStatus.InternalServerError).send({ error: 'Internal Server Error' });
  }
});

// Helper function to convert stream to buffer
function streamToBuffer(stream: stream.Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', (error) => reject(error));
  });
}

// Get all products
app.get('/products', async () => {
  const products = await prisma.product.findMany();
  return products;
});

// Get product by id
app.get('/products/:id', async (request, reply) => {
  try {
    const params = request.params as { id: string };
    const productId = parseInt(params.id, 10);

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      reply.status(HttpStatus.NotFound).send({ error: 'Product not found' });
      return;
    }

    reply.send(product);
  } catch (error: any) {
    console.error('Error fetching product:', error);
    const errorMessage = typeof error === 'string' ? error : (error.message || 'Unknown error');
    reply.status(HttpStatus.InternalServerError).send({
      error: 'Internal Server Error',
      details: errorMessage,
    });
  }
});

// Create product
app.post<{ Body: Product }>('/products', async (request) => {
  try {
    const newProduct = await prisma.product.create({
      data: request.body,
    });

    return newProduct;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
});

// Update product by id
app.put<{ Params: { id: string }, Body: Product }>('/products/:id', async (request, reply) => {
  try {
    const params = request.params;
    const productId = parseInt(params.id, 10);

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: request.body,
    });

    if (!updatedProduct) {
      reply.status(HttpStatus.NotFound).send({ error: 'Product not found' });
      return;
    }

    reply.send(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    reply.status(HttpStatus.InternalServerError).send({ error: 'Failed to update product' });
  }
});

// Delete product by id
app.delete('/products/:id', async (request, reply) => {
  try {
    const params = request.params as { id: string };
    const productId = parseInt(params.id, 10);

    const deletedProduct = await prisma.product.delete({
      where: { id: productId },
    });

    reply.send(deletedProduct);
  } catch (error) {
    console.error(error);
    reply.code(HttpStatus.InternalServerError).send({ error: 'Internal Server Error' });
  }
});

// Run the server
const start = async () => {
  try {
    await app.listen(3000);
    console.log('Server is running on http://localhost:3000');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();

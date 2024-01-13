# product-and-category-creation-with-fastify-and-vue
# Project Title

Building a Fastify TypeScript Project with VueJs, Node.js, Prisma, and MySQL Integration.

## Table of Contents

- [Project Setup](#Project-Setup)
- [Database Integration](#Database-Integration)
- [Categories tables using migration](#categories-tables-using-migration)
- [Products tables using migration](#products-tables-using-migration)
- [Image Handling](#Image-Handling)
- [License](#License)

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint node -r ts-node/register prisma/migrations/seed.ts

```
### API Endpoints / Testing
1- Test the Welcome Endpoint

```
curl http://localhost:3000/
```

2- Get All Categories

```
curl http://localhost:3000/categories
```

3- Create a Category

```
curl -X POST -H "Content-Type: application/json" -d "{\"name\":\"YourCategoryName\"}" http://localhost:3000/categories
```

4- Update Category by ID

```
curl -X PUT -H "Content-Type: application/json" -d "{\"name\":\"UpdatedCategoryName\"}" http://localhost:3000/categories/id
```

5- Delete Category by ID

```
curl -X DELETE http://localhost:3000/categories/id
```

6- Upload Image

```
curl -X POST -H "Content-Type: application/json" -d "{\"upload.jpg\",\"category_id\"id}" http://localhost:3000/upload
```


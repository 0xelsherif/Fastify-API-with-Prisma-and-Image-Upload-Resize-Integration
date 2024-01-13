# Product and Category Creation with Fastify Typescript and Prisma using MySQL
# Project Title

Building a Fastify TS Prisma: Product & Category Creation with MySQL Integration.

## Table of Contents

- [Steps to Run the Project](#Steps-to-Run-the-Project)
- [API Endpoints / Testing](#API-Endpoints-/-Testing)
- [License](#License)

## Steps to Run the Project
1. Clone the Repository:
```
git clone https://github.com/0xelsherif/Product-and-Category-Creation-with-Fastify-Typescript-and-Prisma-using-MySQL.git
cd Product-and-Category-Creation-with-Fastify-Typescript-and-Prisma-using-MySQL
```
2. Install Dependencies:
```
npm install
```
3. Create a Database in PhpMyAdmin:
Open PhpMyAdmin in your browser.
Log in with your credentials.
Click on the "Databases" tab.
Enter a name for your database in the "Create database" field.
Choose the collation (e.g., utf8mb4_general_ci).
Click the "Create" button.
4. Configure .env File:
In the root of your project, find or create a file named .env.
Add the following line to configure your MySQL database connection:
```
DATABASE_URL=mysql://<username>:<password>@localhost:3306/<database>
```
5. Run Database Migrations:
```
npx prisma migrate dev
```
6. Run Database Migrations:
```
node -r ts-node/register prisma/migrations/seed.ts
```
7. Start the Server:
```
npm run start
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

### License

Product and Category Creation with Fastify Typescript and Prisma using MySQL Repository is licensed under the MIT License.
> [!CAUTION]
>No Warranty: The software is provided "as is," without warranty of any kind, express or implied. The author or copyright holder is not liable for any claims or damages arising from the use of the software.

Created by [Ahmed El-sherif](https://github.com/0xelsherif/)
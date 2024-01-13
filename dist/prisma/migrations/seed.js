"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function seed() {
    // Create parent categories
    const parentCategories = [];
    for (const categoryData of [
        { name: 'Residential' },
        { name: 'Commercial' },
        { name: 'Vacation Homes' },
        { name: 'Land' },
        { name: 'Industrial' },
    ]) {
        const category = await prisma.category.create({
            data: categoryData,
        });
        parentCategories.push(category);
    }
    // Create subcategories
    const residentialSubcategory = await prisma.category.create({
        data: { name: 'Single Family Homes', parent: { connect: { id: parentCategories[0].id } } },
    });
    const commercialSubcategory = await prisma.category.create({
        data: { name: 'Office Buildings', parent: { connect: { id: parentCategories[1].id } } },
    });
    const vacationHomesSubcategory = await prisma.category.create({
        data: { name: 'Beachfront Villas', parent: { connect: { id: parentCategories[2].id } } },
    });
    const landResidentialSubcategory = await prisma.category.create({
        data: { name: 'Residential Land', parent: { connect: { id: parentCategories[3].id } } },
    });
    const landCommercialSubcategory = await prisma.category.create({
        data: { name: 'Commercial Land', parent: { connect: { id: parentCategories[3].id } } },
    });
    const industrialWarehousesSubcategory = await prisma.category.create({
        data: { name: 'Warehouses', parent: { connect: { id: parentCategories[4].id } } },
    });
    const industrialPlantsSubcategory = await prisma.category.create({
        data: { name: 'Manufacturing Plants', parent: { connect: { id: parentCategories[4].id } } },
    });
    // Create products
    const products = await prisma.product.createMany({
        data: [
            { name: 'Cozy Home', category_id: residentialSubcategory.id },
            { name: 'Office Space', category_id: commercialSubcategory.id },
            { name: 'Beachfront Getaway', category_id: vacationHomesSubcategory.id },
            { name: 'Residential Plot', category_id: landResidentialSubcategory.id },
            { name: 'Commercial Plot', category_id: landCommercialSubcategory.id },
            { name: 'Warehouse Facility', category_id: industrialWarehousesSubcategory.id },
            { name: 'Manufacturing Facility', category_id: industrialPlantsSubcategory.id },
            { name: 'Luxury Condo', category_id: residentialSubcategory.id },
            { name: 'Retail Shop', category_id: commercialSubcategory.id },
            { name: 'Mountain Chalet', category_id: vacationHomesSubcategory.id },
            { name: 'Agricultural Land', category_id: landResidentialSubcategory.id },
            { name: 'Tech Hub', category_id: industrialWarehousesSubcategory.id },
            // Add other products
        ],
    });
    console.log('Seed completed:', { parentCategories,
        residentialSubcategory,
        commercialSubcategory,
        vacationHomesSubcategory,
        landResidentialSubcategory,
        landCommercialSubcategory,
        industrialWarehousesSubcategory,
        industrialPlantsSubcategory,
        products, });
}
seed()
    .catch((error) => console.error(error))
    .finally(async () => {
    await prisma.$disconnect();
});

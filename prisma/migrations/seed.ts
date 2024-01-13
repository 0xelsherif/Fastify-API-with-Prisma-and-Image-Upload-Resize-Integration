import { PrismaClient, Category } from '@prisma/client';

const prisma = new PrismaClient();

type CategoryCreateInput = {
  name: string;
  parent?: { connect: { id: number } };
};

type ProductCreateInput = {
  name: string;
  category_id: number;
};

async function seed() {
  // Create parent categories
  const parentCategories: Array<Category> = [];
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
  const residentialSubcategory: Category = await prisma.category.create({
    data: { name: 'Single Family Homes', parent: { connect: { id: parentCategories[0].id } } },
  });

  const commercialSubcategory: Category = await prisma.category.create({
    data: { name: 'Office Buildings', parent: { connect: { id: parentCategories[1].id } } },
  });
  const vacationHomesSubcategory: Category = await prisma.category.create({
    data: { name: 'Beachfront Villas', parent: { connect: { id: parentCategories[2].id } } },
  });
  
  const landResidentialSubcategory: Category = await prisma.category.create({
    data: { name: 'Residential Land', parent: { connect: { id: parentCategories[3].id } } },
  });
  
  const landCommercialSubcategory: Category = await prisma.category.create({
    data: { name: 'Commercial Land', parent: { connect: { id: parentCategories[3].id } } },
  });
  
  const industrialWarehousesSubcategory: Category = await prisma.category.create({
    data: { name: 'Warehouses', parent: { connect: { id: parentCategories[4].id } } },
  });
  
  const industrialPlantsSubcategory: Category = await prisma.category.create({
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

  console.log('Seed completed:', {  parentCategories,
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

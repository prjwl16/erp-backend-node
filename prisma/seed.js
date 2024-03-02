// // prisma/seed.js
//
// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();
//
// async function main() {
//   const user1 = prisma.user.create({
//     data: {
//       name: 'John Doe',
//       email: 'john@example.com',
//       password: 'password',
//       role: 'ADMIN',
//       client: {
//         create: {
//           name: 'First Client',
//           email: 'john@example.com',
//           phone: '123-456-7890',
//           address: '123 Main St, City, State, ZIP',
//         },
//       }
//     },
//   });
//
//   const category1 = prisma.category.create({
//     data: {
//       name: 'Furniture',
//     },
//   });
//
//   const warehouse1 = prisma.warehouse.create({
//     data: {
//       name: 'Main Warehouse',
//       location: '123 Main St',
//       address: '123 Main St, City, State, ZIP',
//     },
//   });
//
//   const product1 = prisma.product.create({
//     data: {
//       name: 'Sofa',
//       description: 'Comfortable sofa',
//       price: 1000,
//       stock: 15,
//       images: ["image1.jpg", "image2.jpg"],
//       categoryId: category1.id,
//       createdById: user1.id,
//       updatedById: user1.id,
//       warehouseStocks: {
//         create: [
//           {
//             warehouseId: warehouse1.id,
//             stock: 10,
//           },
//         ],
//       },
//     },
//   });
//   await prisma.$transaction([user1, category1, warehouse1, product1]);
//
// }
//
// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

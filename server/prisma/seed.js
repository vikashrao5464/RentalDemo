import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator with full access'
    }
  })

  const customerRole = await prisma.role.upsert({
    where: { name: 'customer' },
    update: {},
    create: {
      name: 'customer',
      description: 'Regular customer'
    }
  })

  // Create admin user
  const hashedAdminPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@smartrent.com' },
    update: {},
    create: {
      email: 'admin@smartrent.com',
      password: hashedAdminPassword,
      firstName: 'Admin',
      lastName: 'User',
      roleId: adminRole.id
    }
  })

  // Create customer users
  const hashedCustomerPassword = await bcrypt.hash('customer123', 10)
  const customers = []
  
  for (let i = 1; i <= 3; i++) {
    const customer = await prisma.user.upsert({
      where: { email: `customer${i}@example.com` },
      update: {},
      create: {
        email: `customer${i}@example.com`,
        password: hashedCustomerPassword,
        firstName: `Customer`,
        lastName: `${i}`,
        phone: `+91-98765-4321${i}`,
        roleId: customerRole.id
      }
    })
    customers.push(customer)
  }

  // Create categories
  const categories = [
    { name: 'Electronics', description: 'Electronic devices and gadgets' },
    { name: 'Sports', description: 'Sports equipment and gear' },
    { name: 'Tools', description: 'Construction and repair tools' },
    { name: 'Vehicles', description: 'Cars, bikes, and other vehicles' }
  ]

  const createdCategories = []
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category
    })
    createdCategories.push(created)
  }

  // Create base pricelist
  const basePricelist = await prisma.pricelist.upsert({
    where: { name: 'Base Pricing' },
    update: {},
    create: {
      name: 'Base Pricing',
      description: 'Standard pricing for all products',
      isActive: true
    }
  })

  // Create demo products
  const products = [
    {
      name: 'Professional DSLR Camera',
      description: 'High-quality DSLR camera perfect for professional photography and events',
      sku: 'CAM-001',
      dailyDeposit: 200,
      categoryName: 'Electronics',
      images: [
        'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      pricing: { hour: 10, day: 50, week: 300, month: 1000 },
      stock: 5
    },
    {
      name: 'Mountain Bike',
      description: 'Premium mountain bike for outdoor adventures and trail riding',
      sku: 'BIKE-001',
      dailyDeposit: 100,
      categoryName: 'Sports',
      images: [
        'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      pricing: { hour: 5, day: 25, week: 150, month: 500 },
      stock: 8
    },
    {
      name: 'Power Drill Set',
      description: 'Complete power drill set with various bits and accessories',
      sku: 'TOOL-001',
      dailyDeposit: 50,
      categoryName: 'Tools',
      images: [
        'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      pricing: { hour: 3, day: 15, week: 80, month: 250 },
      stock: 12
    },
    {
      name: 'Gaming Laptop',
      description: 'High-performance gaming laptop with latest graphics card',
      sku: 'LAP-001',
      dailyDeposit: 300,
      categoryName: 'Electronics',
      images: [
        'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      pricing: { hour: 8, day: 40, week: 250, month: 800 },
      stock: 3
    },
    {
      name: 'Tent (4-Person)',
      description: 'Spacious 4-person camping tent, waterproof and easy to set up',
      sku: 'TENT-001',
      dailyDeposit: 75,
      categoryName: 'Sports',
      images: [
        'https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      pricing: { day: 20, week: 120, month: 400 },
      stock: 6
    },
    {
      name: 'Electric Scooter',
      description: 'Eco-friendly electric scooter for city commuting',
      sku: 'SCOOT-001',
      dailyDeposit: 150,
      categoryName: 'Vehicles',
      images: [
        'https://images.pexels.com/photos/7163619/pexels-photo-7163619.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      pricing: { hour: 6, day: 30, week: 180, month: 600 },
      stock: 4
    },
    {
      name: 'Professional Projector',
      description: 'High-resolution projector for presentations and events',
      sku: 'PROJ-001',
      dailyDeposit: 250,
      categoryName: 'Electronics',
      images: [
        'https://images.pexels.com/photos/2041540/pexels-photo-2041540.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      pricing: { hour: 12, day: 60, week: 350, month: 1200 },
      stock: 2
    },
    {
      name: 'Kayak (Single)',
      description: 'Single-person kayak perfect for water adventures',
      sku: 'KAYAK-001',
      dailyDeposit: 80,
      categoryName: 'Sports',
      images: [
        'https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      pricing: { hour: 8, day: 35, week: 200, month: 650 },
      stock: 7
    },
    {
      name: 'Wireless Microphone Set',
      description: 'Professional wireless microphone system for events and presentations',
      sku: 'MIC-001',
      dailyDeposit: 120,
      categoryName: 'Electronics',
      images: [
        'https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      pricing: { hour: 15, day: 75, week: 450, month: 1500 },
      stock: 6
    },
    {
      name: 'Camping Backpack',
      description: 'Large capacity hiking backpack with multiple compartments',
      sku: 'PACK-001',
      dailyDeposit: 40,
      categoryName: 'Sports',
      images: [
        'https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      pricing: { day: 12, week: 70, month: 250 },
      stock: 15
    }
  ]

  for (const productData of products) {
    const category = createdCategories.find(c => c.name === productData.categoryName)
    
    const product = await prisma.product.upsert({
      where: { sku: productData.sku },
      update: {},
      create: {
        name: productData.name,
        description: productData.description,
        sku: productData.sku,
        dailyDeposit: productData.dailyDeposit,
        categoryId: category.id,
        isRentable: true,
        isActive: true
      }
    })

    // Create product images
    for (let i = 0; i < productData.images.length; i++) {
      await prisma.productImage.upsert({
        where: { 
          productId_url: {
            productId: product.id,
            url: productData.images[i]
          }
        },
        update: {},
        create: {
          productId: product.id,
          url: productData.images[i],
          altText: `${product.name} image ${i + 1}`,
          isPrimary: i === 0
        }
      })
    }

    // Create stock
    await prisma.stock.upsert({
      where: { productId: product.id },
      update: {},
      create: {
        productId: product.id,
        totalQuantity: productData.stock,
        availableQuantity: productData.stock,
        reservedQuantity: 0
      }
    })

    // Create pricing
    for (const [unit, price] of Object.entries(productData.pricing)) {
      await prisma.pricelistItem.upsert({
        where: {
          pricelistId_productId_categoryId_unit: {
            pricelistId: basePricelist.id,
            productId: product.id,
            categoryId: null,
            unit: unit
          }
        },
        update: {},
        create: {
          pricelistId: basePricelist.id,
          productId: product.id,
          unit: unit,
          rate: price
        }
      })
    }

    // Create some category-level pricing rules as examples
    if (productData.categoryName === 'Electronics') {
      await prisma.pricelistItem.upsert({
        where: {
          pricelistId_productId_categoryId_unit: {
            pricelistId: basePricelist.id,
            productId: null,
            categoryId: category.id,
            unit: 'month'
          }
        },
        update: {},
        create: {
          pricelistId: basePricelist.id,
          categoryId: category.id,
          unit: 'month',
          rate: 2000 // Default monthly rate for electronics
        }
      })
    }
  }

  // Create some default pricing rules
  const defaultRules = [
    { unit: 'hour', rate: 5 },
    { unit: 'day', rate: 30 },
    { unit: 'week', rate: 180 },
    { unit: 'month', rate: 600 }
  ]

  for (const rule of defaultRules) {
    await prisma.pricelistItem.upsert({
      where: {
        pricelistId_productId_categoryId_unit: {
          pricelistId: basePricelist.id,
          productId: null,
          categoryId: null,
          unit: rule.unit
        }
      },
      update: {},
      create: {
        pricelistId: basePricelist.id,
        unit: rule.unit,
        rate: rule.rate
      }
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log(`👤 Admin user: admin@smartrent.com / admin123`)
  console.log(`👥 Customer users: customer1@example.com / customer123 (and customer2, customer3)`)
  console.log(`📦 Created ${products.length} demo products`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
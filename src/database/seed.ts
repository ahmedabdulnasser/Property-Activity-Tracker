import { DataSource } from "typeorm";
import { User } from "../entities/user.entity";
import { SalesRep } from "../entities/sales-rep.entity";
import { Property } from "../entities/property.entity";
import { ActivityType } from "../entities/activity-type.entity";
import { Activity } from "../entities/activity.entity";
import * as bcrypt from "bcryptjs";

export async function seedDatabase(dataSource: DataSource) {
  console.log("Starting database seeding...");

  const userRepository = dataSource.getRepository(User);
  const salesRepRepository = dataSource.getRepository(SalesRep);
  const propertyRepository = dataSource.getRepository(Property);
  const activityTypeRepository = dataSource.getRepository(ActivityType);
  const activityRepository = dataSource.getRepository(Activity);

  // Create Activity Types
  const activityTypes = [
    {
      name: "Call",
      description: "Phone call with prospect/client",
      weight: 10,
    },
    { name: "Email", description: "Email communication", weight: 5 },
    {
      name: "Meeting",
      description: "In-person or virtual meeting",
      weight: 20,
    },
    {
      name: "Property Showing",
      description: "Show property to client",
      weight: 25,
    },
    { name: "Contract Signed", description: "Contract signing", weight: 100 },
    {
      name: "Lead Follow-up",
      description: "Follow up with potential lead",
      weight: 8,
    },
  ];

  for (const activityTypeData of activityTypes) {
    const existingType = await activityTypeRepository.findOne({
      where: { name: activityTypeData.name },
    });
    if (!existingType) {
      const activityType = activityTypeRepository.create(activityTypeData);
      await activityTypeRepository.save(activityType);
      console.log(`Created activity type: ${activityTypeData.name}`);
    }
  }

  // Create Users and Sales Reps
  const users = [
    {
      email: "john.doe@example.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
      phone: "+1234567890",
      role: "sales_rep" as const,
    },
    {
      email: "jane.smith@example.com",
      password: "password123",
      firstName: "Jane",
      lastName: "Smith",
      phone: "+1234567891",
      role: "sales_rep" as const,
    },
    {
      email: "admin@example.com",
      password: "admin123",
      firstName: "Admin",
      lastName: "User",
      phone: "+1234567892",
      role: "admin" as const,
    },
  ];

  for (const userData of users) {
    const existingUser = await userRepository.findOne({
      where: { email: userData.email },
    });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = userRepository.create({
        ...userData,
        password: hashedPassword,
      });
      await userRepository.save(user);
      console.log(`Created user: ${userData.email}`);

      // Create Sales Rep if role is sales_rep
      if (userData.role === "sales_rep") {
        const salesRep = salesRepRepository.create({
          userId: user.id,
          score: 0,
        });
        await salesRepRepository.save(salesRep);
        console.log(`Created sales rep for: ${userData.email}`);
      }
    }
  }

  // Create Properties
  const properties = [
    {
      address: "123 Main St, Downtown",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      propertyType: "apartment" as const,
      bedrooms: 2,
      bathrooms: 2,
      squareFeet: 1200,
      price: 450000,
      status: "available" as const,
      description: "Beautiful downtown apartment with city views",
    },
    {
      address: "456 Oak Ave, Suburbs",
      city: "New York",
      state: "NY",
      zipCode: "10002",
      propertyType: "house" as const,
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1800,
      price: 650000,
      status: "available" as const,
      description: "Spacious family home with large yard",
    },
    {
      address: "789 Business Blvd, Commercial District",
      city: "New York",
      state: "NY",
      zipCode: "10003",
      propertyType: "commercial" as const,
      bedrooms: 0,
      bathrooms: 2,
      squareFeet: 2500,
      price: 850000,
      status: "pending" as const,
      description: "Prime commercial space in business district",
    },
  ];

  for (const propertyData of properties) {
    const existingProperty = await propertyRepository.findOne({
      where: { address: propertyData.address },
    });
    if (!existingProperty) {
      const property = propertyRepository.create(propertyData);
      await propertyRepository.save(property);
      console.log(`Created property: ${propertyData.address}`);
    }
  }

  console.log("Database seeding completed!");
}

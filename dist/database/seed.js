"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = seedDatabase;
const user_entity_1 = require("../entities/user.entity");
const sales_rep_entity_1 = require("../entities/sales-rep.entity");
const property_entity_1 = require("../entities/property.entity");
const activity_type_entity_1 = require("../entities/activity-type.entity");
const activity_entity_1 = require("../entities/activity.entity");
const bcrypt = require("bcryptjs");
async function seedDatabase(dataSource) {
    console.log("Starting database seeding...");
    const userRepository = dataSource.getRepository(user_entity_1.User);
    const salesRepRepository = dataSource.getRepository(sales_rep_entity_1.SalesRep);
    const propertyRepository = dataSource.getRepository(property_entity_1.Property);
    const activityTypeRepository = dataSource.getRepository(activity_type_entity_1.ActivityType);
    const activityRepository = dataSource.getRepository(activity_entity_1.Activity);
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
    const users = [
        {
            email: "john.doe@example.com",
            password: "password123",
            firstName: "John",
            lastName: "Doe",
            phone: "+1234567890",
            role: "sales_rep",
        },
        {
            email: "jane.smith@example.com",
            password: "password123",
            firstName: "Jane",
            lastName: "Smith",
            phone: "+1234567891",
            role: "sales_rep",
        },
        {
            email: "admin@example.com",
            password: "admin123",
            firstName: "Admin",
            lastName: "User",
            phone: "+1234567892",
            role: "admin",
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
    const properties = [
        {
            address: "123 Main St, Downtown",
            city: "New York",
            state: "NY",
            zipCode: "10001",
            propertyType: "apartment",
            bedrooms: 2,
            bathrooms: 2,
            squareFeet: 1200,
            price: 450000,
            status: "available",
            description: "Beautiful downtown apartment with city views",
        },
        {
            address: "456 Oak Ave, Suburbs",
            city: "New York",
            state: "NY",
            zipCode: "10002",
            propertyType: "house",
            bedrooms: 3,
            bathrooms: 2,
            squareFeet: 1800,
            price: 650000,
            status: "available",
            description: "Spacious family home with large yard",
        },
        {
            address: "789 Business Blvd, Commercial District",
            city: "New York",
            state: "NY",
            zipCode: "10003",
            propertyType: "commercial",
            bedrooms: 0,
            bathrooms: 2,
            squareFeet: 2500,
            price: 850000,
            status: "pending",
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

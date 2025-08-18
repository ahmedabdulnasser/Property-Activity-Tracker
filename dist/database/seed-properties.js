"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const csv = require("csv-parse/sync");
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const property_service_1 = require("../modules/property/property.service");
async function main() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const propertyService = app.get(property_service_1.PropertyService);
    const csvPath = path.resolve("c:/Users/ahmed/Downloads/Data sample.csv");
    const csvContent = fs.readFileSync(csvPath, "utf-8");
    const records = csv.parse(csvContent, { columns: true });
    await propertyService.deleteAll();
    for (const record of records) {
        const address = record.address || record.Address || "";
        if (!address)
            continue;
        const propertyName = address.split(",")[0].trim();
        await propertyService.create({ propertyName, address });
    }
    console.log("Properties seeded successfully!");
    await app.close();
}
main().catch((err) => {
    console.error("Seeding failed:", err);
});

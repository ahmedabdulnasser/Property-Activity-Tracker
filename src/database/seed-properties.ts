import * as fs from "fs";
import * as path from "path";
import * as csv from "csv-parse/sync";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { PropertyService } from "../modules/property/property.service";

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const propertyService = app.get(PropertyService);

  // Path to your CSV file
  const csvPath = path.resolve("c:/Users/ahmed/Downloads/Data sample.csv");
  const csvContent = fs.readFileSync(csvPath, "utf-8");
  type PropertyRecord = { address?: string; Address?: string };
  const records = csv.parse(csvContent, { columns: true }) as PropertyRecord[];

  // Delete all properties first
  await propertyService.deleteAll();

  // Seed new properties
  for (const record of records) {
    // Assuming address is in a column named 'address' or similar
    const address = record.address || record.Address || "";
    if (!address) continue;
    const propertyName = address.split(",")[0].trim();
    await propertyService.create({ propertyName, address });
  }

  console.log("Properties seeded successfully!");
  await app.close();
}

main().catch((err) => {
  console.error("Seeding failed:", err);
});

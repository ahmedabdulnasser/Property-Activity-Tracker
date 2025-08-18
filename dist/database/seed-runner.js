"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const typeorm_1 = require("typeorm");
const seed_1 = require("./seed");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const dataSource = app.get(typeorm_1.DataSource);
    try {
        await (0, seed_1.seedDatabase)(dataSource);
        console.log("Seeding completed successfully!");
    }
    catch (error) {
        console.error("Seeding failed:", error);
    }
    finally {
        await app.close();
    }
}
bootstrap();

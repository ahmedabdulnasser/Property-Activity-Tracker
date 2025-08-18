"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: true,
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
    }));
    const { SwaggerModule, DocumentBuilder } = require("@nestjs/swagger");
    const config = new DocumentBuilder()
        .setTitle("Property Activity Tracker API")
        .setDescription("API documentation for all endpoints")
        .setVersion("1.0")
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api", app, document);
    await app.listen(3000);
    console.log(`Application is running on: ${await app.getUrl()}`);
    console.log("Swagger docs available at /api");
    console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();

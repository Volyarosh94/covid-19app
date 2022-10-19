import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { json, urlencoded } from "body-parser";
import { ApiModule } from "./api/api.module";
import { config } from "dotenv";
config();

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(ApiModule, { cors: true, bodyParser: true });
    const port = Number(process.env.WEBSITES_PORT || process.env.APP_PORT) || 3001;

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true
        })
    );

    app.setGlobalPrefix("api");
    app.disable("x-powered-by");
    app.enableCors();
    app.use(urlencoded({ extended: true }));
    app.use(json());

    const swaggerOptions = new DocumentBuilder()
        .setTitle("API Swagger")
        .setDescription("Swagger documentation of IPG MediaBrands notification-service")
        .setVersion("1.0")
        .addBearerAuth({ type: "http", name: "authorization", in: "header", scheme: "bearer", bearerFormat: "JWT" })
        .build();
    const swaggerDocument = SwaggerModule.createDocument(app, swaggerOptions);
    SwaggerModule.setup("/api/docs", app, swaggerDocument);

    await app.listen(port);

    console.log(`Listening on port: ${port}`);
    console.log(`Explore api on http://localhost:${port}/api/docs`);
}

bootstrap();

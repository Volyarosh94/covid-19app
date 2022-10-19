import { config } from "dotenv";
config();
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ApiModule } from "./api/api.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ValidationPipe } from "@nestjs/common";
import { ResponseTransformInterceptor } from "./api/interceptors/responceTransformInterceptor";
import { ErrorResponseExceptionFilter } from "./api/filters/errorResponseException.filter";
import { urlencoded, json } from "body-parser";

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(ApiModule, { bodyParser: true, cors: true });
    const port = Number(process.env.WEBSITES_PORT || process.env.APP_PORT) || 3000;

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

    app.useGlobalInterceptors(new ResponseTransformInterceptor());
    app.useGlobalFilters(new ErrorResponseExceptionFilter());

    const swaggerOptions = new DocumentBuilder()
        .setTitle("API Swagger")
        .setDescription("Swagger documentation of IPG MediaBrands backend")
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

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const prisma_service_1 = require("./prisma/prisma.service");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    const prisma = app.get(prisma_service_1.PrismaService);
    await prisma.enableShutdownHooks(app);
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    if (process.env.NODE_ENV !== 'production') {
        console.log(`\n\x1b[36m========================================\n\n   Frontend is running at: http://localhost:3000\n   Backend API is running at: http://localhost:${port}\n\n========================================\x1b[0m\n`);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map
import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const prisma = app.get(PrismaService);
  await prisma.enableShutdownHooks(app);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n\x1b[36m========================================\n\n   Frontend is running at: http://localhost:3000\n   Backend API is running at: http://localhost:${port}\n\n========================================\x1b[0m\n`);
  }
}
bootstrap();

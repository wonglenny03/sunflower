import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Enable CORS
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
  const allowedOrigins = [frontendUrl, 'http://localhost:3000', 'http://127.0.0.1:3000']

  // 如果 FRONTEND_URL 包含 IP 地址，也添加
  if (frontendUrl.includes('://')) {
    const urlParts = frontendUrl.split('://')
    if (urlParts.length === 2) {
      const host = urlParts[1].split(':')[0]
      // 如果是 IP 地址，添加 http 和 https 版本
      if (/^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/.test(host)) {
        allowedOrigins.push(`http://${host}:3000`)
        allowedOrigins.push(`https://${host}:3000`)
      }
    }
  }

  app.enableCors({
    origin: (origin, callback) => {
      // 允许没有 origin 的请求（如移动应用、Postman 等）
      if (!origin) {
        return callback(null, true)
      }
      // 检查是否在允许列表中
      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        // 开发环境允许所有来源
        if (process.env.NODE_ENV === 'development') {
          callback(null, true)
        } else {
          callback(new Error('Not allowed by CORS'))
        }
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  // API prefix
  app.setGlobalPrefix('api')

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Company Search API')
    .setDescription('Company Search System API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  const port = process.env.PORT || 3001
  await app.listen(port)
  console.log(`Application is running on: http://localhost:${port}`)
  console.log(`Swagger documentation: http://localhost:${port}/api/docs`)
}

bootstrap()

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../src/user/entities/user.entity';
import * as crypto from 'crypto';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepository = app.get<Repository<User>>('UserRepository');

  const hashedPassword = crypto
    .createHash('sha256')
    .update('admin123')
    .digest('hex');

  const adminUser = userRepository.create({
    email: 'admin@benchmark.com',
    password: hashedPassword,
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
  });

  try {
    const result = await userRepository.save(adminUser);
    console.log('Admin user created:', result);
  } catch (error) {
    console.log('Error creating admin (may already exist):', error.message);
  }

  await app.close();
}

bootstrap();
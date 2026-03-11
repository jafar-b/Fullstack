import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([
          {
            ttl: 60000,
            limit: 10,
          },
        ]),
      ],
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({
        canActivate: () => true,
      })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: () => true,
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user with valid data', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      const expectedResult = {
        success: true,
        data: {
          id: 1,
          email: 'test@example.com',
          password: 'hashed',
          firstName: 'John',
          lastName: 'Doe',
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      };

      mockUserService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should handle email conflict error', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockUserService.create.mockRejectedValue(
        new ConflictException('Email already exists'),
      );

      await expect(controller.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all users with pagination', async () => {
      const expectedResult = {
        success: true,
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      };

      mockUserService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(1, 10);

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(1, 10, undefined, 'DESC');
    });

    it('should filter users by role', async () => {
      const expectedResult = {
        success: true,
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      };

      mockUserService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(1, 10, 'admin', 'ASC');

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(1, 10, 'admin', 'ASC');
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const expectedResult = {
        success: true,
        data: {
          id: 1,
          email: 'test@example.com',
          password: 'hashed',
          firstName: 'John',
          lastName: 'Doe',
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      };

      mockUserService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne('1');

      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUserService.findOne.mockRejectedValue(
        new NotFoundException('User with ID 999 not found'),
      );

      await expect(controller.findOne('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a user with valid data', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
      };

      const expectedResult = {
        success: true,
        data: {
          id: 1,
          email: 'test@example.com',
          password: 'hashed',
          firstName: 'Jane',
          lastName: 'Doe',
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      };

      mockUserService.update.mockResolvedValue(expectedResult);

      const result = await controller.update('1', updateUserDto);

      expect(result).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith(1, updateUserDto);
    });

    it('should throw NotFoundException when updating non-existent user', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
      };

      mockUserService.update.mockRejectedValue(
        new NotFoundException('User with ID 999 not found'),
      );

      await expect(controller.update('999', updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when email already exists', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'existing@example.com',
      };

      mockUserService.update.mockRejectedValue(
        new ConflictException('Email already in use by another user'),
      );

      await expect(controller.update('1', updateUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      mockUserService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when removing non-existent user', async () => {
      mockUserService.remove.mockRejectedValue(
        new NotFoundException('User with ID 999 not found'),
      );

      await expect(controller.remove('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

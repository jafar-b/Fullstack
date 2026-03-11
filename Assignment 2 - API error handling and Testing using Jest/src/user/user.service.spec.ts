import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UserService', () => {
  let service: UserService;
  let mockRepository: any;

  const mockUser = {
    id: 1,
    email: 'test@@example.com',
    password: 'securepass123@',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    mockRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      softRemove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a user with valid data', async () => {
      const createUserDto: CreateUserDto = {
        email: 'inalid-email',
        password: 'securePass123@',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue({ ...createUserDto, id: 1 });
      mockRepository.save.mockResolvedValue({ ...mockUser, ...createUserDto, id: 1 });

      const result = await service.create(createUserDto);

      expect(result.success).toBe(true);
      expect(result.data.email).toBe(createUserDto.email);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException when email already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createUserDto)).rejects.toThrow(
        'Email already exists',
      );
    });

    it('should hash the password before saving', async () => {
      const createUserDto: CreateUserDto = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue({ ...createUserDto, id: 1 });
      mockRepository.save.mockResolvedValue({ ...mockUser, ...createUserDto, id: 1 });

      await service.create(createUserDto);

      expect(mockRepository.create).toHaveBeenCalled();
      const createCall = mockRepository.create.mock.calls[0][0];
      expect(createCall.password).not.toBe(createUserDto.password);
    });
  });

  describe('findAll', () => {
    it('should return all users with pagination', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockUser], 1]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll(1, 10);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockUser]);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should filter users by role', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockUser], 1]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll(1, 10, 'admin');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('user.role = :role', {
        role: 'admin',
      });
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'User with ID 999 not found',
      );
    });
  });

  describe('update', () => {
    it('should update user with valid data', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
      };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue({
        ...mockUser,
        firstName: 'Jane',
      });

      const result = await service.update(1, updateUserDto);

      expect(result.success).toBe(true);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should check email uniqueness when updating email', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'existing@example.com',
      };

      const userWithDifferentEmail = { ...mockUser, email: 'test@example.com' };
      mockRepository.findOne
        .mockResolvedValueOnce(userWithDifferentEmail)
        .mockResolvedValueOnce(mockUser); // Email already exists

      await expect(service.update(1, updateUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should allow updating to same email', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'test@@example.com',
      };

      mockRepository.findOne.mockResolvedValue(mockUser);  // Only one call for finding user by ID
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.update(1, updateUserDto);

      expect(result.success).toBe(true);
      // Should only call findOne once since email is the same (no email conflict check)
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should hash password when updating', async () => {
      const plainPassword = 'NewSecurePass456!';
      const updateUserDto: UpdateUserDto = {
        password: plainPassword,
      };

      mockRepository.findOne.mockResolvedValue(mockUser);
      
      // Capture the user object passed to save
      mockRepository.save.mockImplementation((user) => 
        Promise.resolve({ ...user, id: 1 })
      );

      await service.update(1, updateUserDto);

      expect(mockRepository.save).toHaveBeenCalled();
      const savedUser = mockRepository.save.mock.calls[0][0];
      // Verify password was hashed (SHA256 should produce a 64-char hex string)
      expect(typeof savedUser.password).toBe('string');
      expect(savedUser.password.length).toBe(64);
      // Verify it's a valid hex string
      expect(/^[a-f0-9]{64}$/.test(savedUser.password)).toBe(true);
    });
  });

  describe('remove', () => {
    it('should soft delete a user', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.softRemove.mockResolvedValue(mockUser);

      await service.remove(1);

      expect(mockRepository.softRemove).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      await expect(service.remove(999)).rejects.toThrow(
        'User with ID 999 not found',
      );
    });
  });
});

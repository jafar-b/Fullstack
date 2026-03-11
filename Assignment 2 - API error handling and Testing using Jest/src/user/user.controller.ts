import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('api/v1/users')
@UseGuards(ThrottlerGuard, JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
   }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('role') role?: string,
    @Query('sort') sort: 'ASC' | 'DESC' = 'DESC',
  ) {
    return this.userService.findAll(
      Number(page),
      Math.min(Number(limit), 50),
      role,
      sort,
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(Number(id));
  }

  @Patch(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(Number(id), updateUserDto);
  }

  @Put(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  replace(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(Number(id), updateUserDto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.userService.remove(Number(id));
  }
}
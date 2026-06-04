import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { UsersService } from './users.service';

type AuthenticatedRequest = { user: { userId: number; role: Role } };

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  async list(@Query() query: PaginationQueryDto, @Request() req: AuthenticatedRequest) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const q = query.q?.trim() || undefined;
    return this.users.list(page, limit, req.user.role, q);
  }

  @Get(':id')
  async getById(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    const user = await this.users.findById(id, req.user.role);
    return { total: 1, page: 1, limit: 1, data: [user] };
  }

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() body: CreateUserDto, @Request() req: AuthenticatedRequest) {
    const user = await this.users.create(body, req.user.role);
    return { total: 1, page: 1, limit: 1, data: [user] };
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.users.remove(id);
    return { ok: true };
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateUserDto) {
    const user = await this.users.update(id, body);
    return { total: 1, page: 1, limit: 1, data: [user] };
  }
}

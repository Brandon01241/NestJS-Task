import { Role } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEmail, IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MaxLength(100)
  password!: string;

  @IsString()
  @MaxLength(100)
  name!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  age!: number;

  @IsString()
  @MaxLength(50)
  hkidNumber!: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}


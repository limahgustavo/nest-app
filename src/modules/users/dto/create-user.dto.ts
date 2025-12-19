import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MinLength,
    IsEnum,
} from 'class-validator';
import { Role } from '../../../core/enums/role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    @ApiProperty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @ApiProperty()
    password: string;

    @IsEnum(Role)
    @IsNotEmpty()
    @ApiProperty()
    role: Role;
}

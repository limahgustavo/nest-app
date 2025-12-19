import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
    ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../../core/decorators/roles.decorator';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Role } from '../../core/enums/role.enum';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @Roles(Role.ADMIN)
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    @Roles(Role.ADMIN)
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    @Roles(Role.USER)
    findOne(@Param('id') id: string, @Request() req) {
        const user = this.usersService.findOne(id);

        if (!user) {
            throw new ForbiddenException('User not found');
        }

        // Users can only view their own profile unless they're admin
        if (req.user.role !== Role.ADMIN && req.user.id !== id) {
            throw new ForbiddenException('You can only view your own profile');
        }

        const { password, ...result } = user;
        return result;
    }

    @Patch(':id')
    @Roles(Role.USER)
    update(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        @Request() req,
    ) {
        // Users can only update their own profile unless they're admin
        if (req.user.role !== Role.ADMIN && req.user.id !== id) {
            throw new ForbiddenException('You can only update your own profile');
        }

        return this.usersService.update(id, updateUserDto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
    private users: User[] = [];

    create(createUserDto: CreateUserDto): User {
        const user: User = {
            id: uuidv4(),
            ...createUserDto,
        };

        this.users.push(user);
        return user;
    }

    findAll(): User[] {
        return this.users.map(({ password, ...user }) => user as any);
    }

    findOne(id: string): User | undefined {
        const user = this.users.find((u) => u.id === id);
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    findByEmail(email: string): User | undefined {
        return this.users.find((u) => u.email === email);
    }

    update(id: string, updateUserDto: UpdateUserDto): User {
        const userIndex = this.users.findIndex((u) => u.id === id);

        if (userIndex === -1) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        this.users[userIndex] = {
            ...this.users[userIndex],
            ...updateUserDto,
        };

        return this.users[userIndex];
    }

    remove(id: string): void {
        const userIndex = this.users.findIndex((u) => u.id === id);

        if (userIndex === -1) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        this.users.splice(userIndex, 1);
    }
}

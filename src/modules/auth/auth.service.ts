import {
    Injectable,
    UnauthorizedException,
    ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto) {
        const existingUser = await this.usersService.findByEmail(
            registerDto.email,
        );

        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        const user = await this.usersService.create({
            ...registerDto,
            password: hashedPassword,
        });

        const { password, ...result } = user;
        return {
            ...result,
            access_token: this.generateToken(user),
        };
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const { password, ...result } = user;
        return {
            ...result,
            access_token: this.generateToken(user),
        };
    }

    async validateUser(email: string, password: string) {
        const user = await this.usersService.findByEmail(email);

        if (!user) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return null;
        }

        return user;
    }

    private generateToken(user: any) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        return this.jwtService.sign(payload);
    }
}

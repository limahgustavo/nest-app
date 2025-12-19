import { Role } from '../../../core/enums/role.enum';

export interface User {
    id: string;
    email: string;
    password: string;
    role: Role;
}

import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { AccessControlService } from '../../shared/services/access-control.service';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private accessControlService: AccessControlService,
    ) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.token || request.user;

        if (!user || !user.role) {
            throw new ForbiddenException('User role not found');
        }

        const hasRole = requiredRoles.some((role) =>
            this.accessControlService.isAuthorized({
                currentRole: user.role,
                requiredRole: role,
            }),
        );

        if (!hasRole) {
            throw new ForbiddenException(
                `User with role ${user.role} does not have access to this resource`,
            );
        }

        return true;
    }
}

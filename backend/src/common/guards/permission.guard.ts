// import {
//   Injectable,
//   CanActivate,
//   ExecutionContext,
//   Logger,
//   ForbiddenException,
// } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { GqlExecutionContext } from '@nestjs/graphql';
// import { AdminService } from 'src/modules/auth/services/admin.service';
// import { ErrorCode } from '../constants/error.constants';
// import { PERMISSIONS_KEY } from '../decorators/permission.decorator';

// /**
//  * Guard that checks if user has required permissions
//  */
// @Injectable()
// export class PermissionGuard implements CanActivate {
//   private readonly logger = new Logger(PermissionGuard.name);

//   /**
//    * Constructor
//    * @param reflector For accessing route metadata
//    * @param adminService Admin service for checking admin permissions
//    */
//   constructor(
//     private readonly reflector: Reflector,
//     private readonly adminService: AdminService,
//   ) {}

//   /**
//    * Check if current user has required permissions
//    * @param context Execution context
//    * @returns Boolean indicating access permission
//    */
//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     // Get required permissions from route metadata
//     const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
//       PERMISSIONS_KEY,
//       [context.getHandler(), context.getClass()],
//     );

//     // If no permissions required, allow access
//     if (!requiredPermissions || requiredPermissions.length === 0) {
//       return true;
//     }

//     // Get request object based on context type
//     let request: any;

//     if (context.getType() === 'http') {
//       request = context.switchToHttp().getRequest();
//     } else if (context.getType<string>() === 'graphql') {
//       const gqlContext = GqlExecutionContext.create(context);
//       request = gqlContext.getContext().req;
//     } else {
//       this.logger.warn(`Unsupported context type: ${context.getType()}`);
//       return false;
//     }

//     // No user in request means not authenticated
//     if (!request.user) {
//       return false;
//     }

//     try {
//       // For admins, check if they have any of the required permissions
//       for (const permission of requiredPermissions) {
//         const hasPermission = await this.adminService.hasPermission(
//           request.user.id,
//           permission,
//         );

//         if (hasPermission) {
//           return true; // Admin has at least one of the required permissions
//         }
//       }

//       // If we reach here, the user doesn't have sufficient permissions
//       throw new ForbiddenException({
//         errorCode: ErrorCode.FORBIDDEN,
//         message: 'Insufficient permissions',
//       });
//     } catch (error) {
//       this.logger.error(
//         `Permission check error: ${error.message}`,
//         error.stack,
//       );

//       if (error instanceof ForbiddenException) {
//         throw error;
//       }

//       return false;
//     }
//   }
// }

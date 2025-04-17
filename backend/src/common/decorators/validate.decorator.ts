import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

/**
 * Custom validator to check if a string is a valid Malayalam text
 */
export function IsMalayalam(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isMalayalam',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          
          // Malayalam Unicode range: 0D00-0D7F
          const malayalamRegex = /[\u0D00-\u0D7F]/;
          return malayalamRegex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must contain Malayalam text`;
        },
      },
    });
  };
}

/**
 * Custom validator to check if a string is a valid slug
 */
export function IsSlug(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isSlug',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          
          const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
          return slugRegex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid slug (lowercase letters, numbers, and hyphens)`;
        },
      },
    });
  };
}

/**
 * Custom validator to check if an array has unique values
 */
export function ArrayUnique(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'arrayUnique',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!Array.isArray(value)) return false;
          
          const uniqueItems = new Set(value);
          return uniqueItems.size === value.length;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must contain unique values`;
        },
      },
    });
  };
}
import { ValidateIf, ValidationOptions } from "class-validator";

export function IsNullable(options?: ValidationOptions): PropertyDecorator {
    return function IsNullableDecorator(prototype: object, propertyKey: string | symbol): void {
        ValidateIf((obj): boolean => ![null, undefined].includes(obj[propertyKey]), options)(prototype, propertyKey);
    };
}

import { registerEnumType } from "@nestjs/graphql";

export enum ProductType {
    Laptop = "Laptop",
    Smartphone = "Smartphone",
    Smartwatch = "Smartwatch",
}
registerEnumType(ProductType, {
    name: "ProductType",
});

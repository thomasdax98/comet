import { CrudGeneratorConfig } from "@comet/cms-admin";
export default [
    {
        target: "src/news/generated",
        entityName: "News",
    },
    {
        target: "src/shop/products/generated",
        entityName: "Product",
        rootBlocks: { image: { name: "DamImageBlock", import: "@comet/cms-admin" } },
    },
    {
        target: "src/shop/customers/generated",
        entityName: "Customer",
    },
] satisfies CrudGeneratorConfig[];

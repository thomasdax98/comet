# @comet/cms-api

## 4.3.0

### Minor Changes

-   afc7a6b6: Add human readable label for publisher (cron jobs and jobs)
-   b4264f18: Make changes checker scope-aware

### Patch Changes

-   44fbe3f9: add stream end when create files from buffer in filestorage
-   92f23a46: Change propagationPolicy for deleting jobs from default to Background

    Currently we use the default propagationPolicy for deleting jobs. This results in pods from jobs being deleted in k8s but not on OpenShift. With the value fixed to "Background", the jobs should get deleted on every system.
    Foreground would be blocking, so we use Background to be non blocking.

    -   @comet/blocks-api@4.3.0

## 4.2.0

### Minor Changes

-   0fdb1b33: Add new extractGraphqlFields helper function that extracts requested fields from GraphQLResolveInfo

    Usage example:

    ```
    async products(@Info() info: GraphQLResolveInfo): Promise<PaginatedProducts> {
        const fields = extractGraphqlFields(info, { root: "nodes" });
        const options: FindOptions<Product, any> = { };
        if (fields.includes("category")) options.populate = ["category"];
        //alternative if graphql structure completely matches entities: options.populate = fields;
        const [entities, totalCount] = await this.repository.findAndCount({}, options);
    ```

### Patch Changes

-   @comet/blocks-api@4.2.0

## 4.1.0

### Minor Changes

-   51466b1a: Add support for enum types to API CRUD Generator

### Patch Changes

-   51466b1a: Fix page tree node visibility update
    -   @comet/blocks-api@4.1.0

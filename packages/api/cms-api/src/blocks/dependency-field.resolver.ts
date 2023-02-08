import { EntityClass } from "@mikro-orm/core/typings";
import { Type } from "@nestjs/common";
import { Parent, ResolveField, Resolver } from "@nestjs/graphql";

import { BlockIndexService } from "./block-index.service";
import { BlockIndexDependency } from "./block-index-dependency";

export function createDependenciesFieldResolver({ Entity }: { Entity: EntityClass<any> }): Type<unknown> {
    @Resolver(() => Entity)
    class DependenciesFieldResolver {
        constructor(private readonly blockIndexService: BlockIndexService) {}

        @ResolveField(() => [BlockIndexDependency])
        async dependencies(@Parent() entity: EntityClass<any>): Promise<BlockIndexDependency[]> {
            return this.blockIndexService.getDependenciesByEntityNameAndRootId(entity.name, entity.id);
        }
    }

    return DependenciesFieldResolver;
}

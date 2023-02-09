import { EntityManager } from "@mikro-orm/core";
import { EntityClass } from "@mikro-orm/core/typings";
import { Type } from "@nestjs/common";
import { Parent, ResolveField, Resolver, Union } from "@nestjs/graphql";
import * as console from "console";

import { BlockIndexService } from "./block-index.service";

export function createDependenciesFieldResolver({
    Entity,
    RootEntityUnion,
}: {
    Entity: EntityClass<any>;
    RootEntityUnion: Union<unknown[]>;
}): Type<unknown> {
    @Resolver(() => Entity)
    class DependenciesFieldResolver {
        constructor(private readonly blockIndexService: BlockIndexService, private readonly em: EntityManager) {}

        @ResolveField(() => [RootEntityUnion])
        async dependencies(@Parent() entity: EntityClass<any>): Promise<typeof RootEntityUnion[]> {
            // TODO better typing
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const blockIndexDependencies = await this.blockIndexService.getDependentsByEntityNameAndTargetId(Entity.name, entity.id);

            const results: typeof RootEntityUnion[] = [];
            for (const blockIndexDependency of blockIndexDependencies) {
                const repository = this.em.getRepository(blockIndexDependency.entityName);

                const result = await repository.findOne({ [blockIndexDependency.primaryKey]: blockIndexDependency.id });
                results.push(result);
            }

            console.log("blockIndexDependencies ", blockIndexDependencies);
            console.log("results ", results);

            return results;
        }
    }

    return DependenciesFieldResolver;
}

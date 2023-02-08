import { DynamicModule, Global, Module, ModuleMetadata, Provider } from "@nestjs/common";
import * as console from "console";

import { BlockIndexService } from "./block-index.service";
import { BlockMigrateService } from "./block-migrate.service";
import { BLOCKS_MODULE_OPTIONS, BLOCKS_MODULE_TRANSFORMER_DEPENDENCIES } from "./blocks.constants";
import { BlocksMetaService } from "./blocks-meta.service";
import { BlocksTransformerService } from "./blocks-transformer.service";
import { CommandsService } from "./commands.service";
import { createDependenciesFieldResolver } from "./dependency-field.resolver";
import { DiscoverService } from "./discover.service";

export interface BlocksModuleOptions {
    transformerDependencies: Record<string, unknown>;
}

export interface BlocksModuleAsyncOptions extends Pick<ModuleMetadata, "imports"> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useFactory: (...args: any[]) => Promise<BlocksModuleOptions> | BlocksModuleOptions;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inject?: any[];
    withoutIndex?: boolean;
}

@Global()
@Module({})
export class BlocksModule {
    static forRootAsync(options: BlocksModuleAsyncOptions): DynamicModule {
        const optionsProvider = {
            provide: BLOCKS_MODULE_OPTIONS,
            ...options,
        };

        const transformerDependenciesProvider = {
            provide: BLOCKS_MODULE_TRANSFORMER_DEPENDENCIES,
            useFactory: async (options: BlocksModuleOptions): Promise<Record<string, unknown>> => {
                return options.transformerDependencies;
            },
            inject: [BLOCKS_MODULE_OPTIONS],
        };

        const dependencyProviders: Provider = {
            provide: "DependencyProviders",
            useFactory: (discoverService: DiscoverService) => {
                const rootEntities = discoverService.discoverRootEntities();

                const fieldResolvers = [];
                for (const rootEntity of rootEntities) {
                    console.log("rootEntity ", rootEntity);
                    fieldResolvers.push(createDependenciesFieldResolver({ Entity: rootEntity }));
                }

                console.log("fieldResolvers ", fieldResolvers);

                return fieldResolvers;
            },
            inject: [DiscoverService],
        };

        const rootEntities = discoverService.discoverRootEntities();

        const fieldResolvers = [];
        for (const rootEntity of rootEntities) {
            console.log("rootEntity ", rootEntity);
            fieldResolvers.push(createDependenciesFieldResolver({ Entity: rootEntity }));
        }

        return {
            module: BlocksModule,
            imports: options.imports ?? [],
            providers: [
                optionsProvider,
                transformerDependenciesProvider,
                BlocksTransformerService,
                BlocksMetaService,
                ...fieldResolvers,
                ...(!options.withoutIndex ? [DiscoverService, BlockIndexService, CommandsService, BlockMigrateService] : []),
            ],
            exports: [BlocksTransformerService, ...(!options.withoutIndex ? [BlockIndexService] : [])],
        };
    }
}

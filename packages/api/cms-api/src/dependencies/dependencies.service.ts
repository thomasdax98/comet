import { AnyEntity, Connection, QueryOrder } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityManager, EntityRepository } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import * as console from "console";
import { subMinutes } from "date-fns";

import { Dependency } from "./dependency";
import { DiscoverService } from "./discover.service";
import { RefreshBlockIndex } from "./entities/refresh-block-index.entity";

@Injectable()
export class DependenciesService {
    private entityManager: EntityManager;
    private connection: Connection;

    constructor(
        @InjectRepository(RefreshBlockIndex) private readonly refreshRepository: EntityRepository<RefreshBlockIndex>,
        private readonly discoverService: DiscoverService,
        entityManager: EntityManager,
    ) {
        this.entityManager = entityManager;
        this.connection = entityManager.getConnection();
    }

    async createViews(): Promise<void> {
        const indexSelects: string[] = [];
        const targetEntities = this.discoverService.discoverTargetEntities();

        const targetEntitiesNameData = targetEntities.reduce((obj, entity) => {
            return {
                ...obj,
                [entity.entityName]: {
                    entityName: entity.entityName,
                    tableName: entity.metadata.tableName,
                    primary: entity.metadata.primaryKeys[0],
                    graphqlObjectType: entity.graphqlObjectType,
                },
            };
        }, {});

        for (const rootBlockEntity of this.discoverService.discoverRootBlocks()) {
            const { metadata, column, graphqlObjectType } = rootBlockEntity;
            const primary = metadata.primaryKeys[0];

            const select = `SELECT
                            "${metadata.tableName}"."${primary}"  "rootId",
                            '${metadata.name}'                    "rootEntityName",
                            '${graphqlObjectType}'                "rootGraphqlObjectType",
                            '${metadata.tableName}'               "rootTableName",
                            '${column}'                           "rootColumnName",
                            '${primary}'                          "rootPrimaryKey",
                            indexObj->>'blockname'                "blockname",
                            indexObj->>'jsonPath'                 "jsonPath",
                            (indexObj->>'visible')::boolean       "visible",
                            targetTableData->>'entityName'        "targetEntityName",
                            targetTableData->>'graphqlObjectType' "targetGraphqlObjectType",
                            targetTableData->>'tableName'         "targetTableName",
                            targetTableData->>'primary'           "targetPrimaryKey",
                            dependenciesObj->>'id' "targetId"
                        FROM "${metadata.tableName}",
                            json_array_elements("${metadata.tableName}"."${column}"->'index') indexObj,
                            json_array_elements(indexObj->'dependencies') dependenciesObj,
                            json_extract_path('${JSON.stringify(targetEntitiesNameData)}', dependenciesObj->>'targetEntityName') targetTableData`;

            indexSelects.push(select);
        }

        const viewSql = indexSelects.join("\n UNION ALL \n");

        console.time("creating block dependency materialized view");
        await this.connection.execute(`DROP MATERIALIZED VIEW IF EXISTS block_index_dependencies`);
        await this.connection.execute(`CREATE MATERIALIZED VIEW block_index_dependencies AS ${viewSql}`);
        await this.connection.execute(
            `CREATE UNIQUE INDEX ON block_index_dependencies ("rootId", "rootTableName", "rootColumnName", "blockname", "jsonPath", "targetTableName", "targetId")`,
        );
        console.timeEnd("creating block dependency materialized view");

        console.time("creating block dependency materialized view index");
        await this.connection.execute(`CREATE INDEX block_index_dependencies_targetId ON block_index_dependencies ("targetId")`);
        console.timeEnd("creating block dependency materialized view index");
    }

    async refreshViews(options?: { force?: boolean; consoleCommand?: boolean }): Promise<void> {
        const refresh = async (options?: { concurrently: boolean }) => {
            console.time("refresh materialized block dependency");
            const refreshBlockIndex = this.refreshRepository.create({ startedAt: new Date() });
            await this.refreshRepository.getEntityManager().persistAndFlush(refreshBlockIndex);

            await this.connection.execute(`REFRESH MATERIALIZED VIEW ${options?.concurrently ? "CONCURRENTLY" : ""} block_index_dependencies`);

            await this.refreshRepository.getEntityManager().persistAndFlush(Object.assign(refreshBlockIndex, { finishedAt: new Date() }));
            console.timeEnd("refresh materialized block dependency");
        };

        if (options?.force) {
            console.log("force refresh -> refresh sync");
            await this.refreshRepository.qb().truncate();
            await refresh();
            return;
        }

        const lastRefreshes = await this.refreshRepository.find({}, { orderBy: { finishedAt: QueryOrder.DESC_NULLS_FIRST }, limit: 1 });
        if (lastRefreshes.length === 0) {
            console.log("first refresh -> refresh sync");
            await refresh();
            return;
        }

        const lastRefresh = lastRefreshes[0];
        // if the DB state indicates that a refresh takes more than 15 minutes,
        // it's likely that the previous refresh isn't actually in progress but was interrupted unexpectedly
        const isRefreshInProgress = lastRefresh.finishedAt === null && lastRefresh.startedAt > subMinutes(new Date(), 15);

        if (isRefreshInProgress) {
            console.log("refresh in progress -> do nothing");
            return;
        } else if (lastRefresh.finishedAt && lastRefresh.finishedAt > subMinutes(new Date(), 5)) {
            console.log("newer than 5 minutes -> don't refresh");
            return;
        } else if (lastRefresh.finishedAt && lastRefresh.finishedAt > subMinutes(new Date(), 15)) {
            console.log("newer than 15 minutes -> refresh async");
            const refreshPromise = refresh({ concurrently: true });
            if (options?.consoleCommand) {
                await refreshPromise;
            }
        } else {
            console.log("older than 15 minutes -> refresh sync");
            await refresh();
        }
    }

    async getDependents(target: AnyEntity<{ id: string }>): Promise<Dependency[]> {
        const entityName = target.constructor.name;
        return this.connection.execute(`SELECT * FROM block_index_dependencies as idx WHERE idx."targetEntityName" = ? AND idx."targetId" = ?`, [
            entityName,
            target.id,
        ]);
    }

    async getDependencies(root: AnyEntity<{ id: string }>): Promise<Dependency[]> {
        const entityName = root.constructor.name;
        return this.connection.execute(`SELECT * FROM block_index_dependencies as idx WHERE idx."rootEntityName" = ? AND idx."rootId" = ?`, [
            entityName,
            root.id,
        ]);
    }
}

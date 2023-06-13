import { ChangesSinceLastBuild } from "@comet/cms-api";
import { Options } from "@mikro-orm/core";
import { PageTreeNodeScope } from "@src/page-tree/dto/page-tree-node-scope";

import ormConfig from "./ormconfig";

const config: Options = {
    ...ormConfig,
    entities: ["./dist/**/*.entity.js", PageTreeNodeScope, ChangesSinceLastBuild],
    entitiesTs: ["./src/**/*.entity.ts", PageTreeNodeScope, ChangesSinceLastBuild],
};

export = config;

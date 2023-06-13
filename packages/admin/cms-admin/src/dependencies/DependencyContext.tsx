import { ApolloClient } from "@apollo/client";
import * as React from "react";

import { GQLDependency } from "../graphql.generated";

export interface DependencyRenderInfoOptions {
    data: Pick<GQLDependency, "rootGraphqlObjectType" | "rootId" | "rootColumnName" | "jsonPath">;
    apolloClient: ApolloClient<unknown>;
    contentScopeUrl: string;
}
export interface DependencyRenderInfo {
    type: React.ReactNode;
    name: React.ReactNode;
    secondaryInfo?: React.ReactNode;
    url?: string;
}

export type GetRenderInfo = (id: string, options: DependencyRenderInfoOptions) => Promise<DependencyRenderInfo> | DependencyRenderInfo;

export interface DependenciesConfig {
    dependencyRenderInfoProvider?: {
        [key: string]: GetRenderInfo;
    };
}

const DependenciesConfigContext = React.createContext<DependenciesConfig | undefined>(undefined);

export const DependenciesConfigProvider: React.FunctionComponent<{ value: DependenciesConfig }> = ({ children, value }) => {
    return <DependenciesConfigContext.Provider value={value}>{children}</DependenciesConfigContext.Provider>;
};

export const useDependenciesConfig = (): DependenciesConfig => {
    const context = React.useContext(DependenciesConfigContext);
    return context ?? {};
};

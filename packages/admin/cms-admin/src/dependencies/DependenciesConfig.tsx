import * as React from "react";

import { FileDependency } from "../dam/FileDependency";
import { DependencyComponent } from "./Dependency";

export interface DependencyRootEntities {
    [graphqlObjectType: string]: {
        DependencyComponent: DependencyComponent;
    };
}

const DependenciesConfigContext = React.createContext<DependencyRootEntities | undefined>(undefined);

export const DependenciesConfigProvider: React.FunctionComponent<{ rootEntities: DependencyRootEntities }> = ({ children, rootEntities }) => {
    return (
        <DependenciesConfigContext.Provider
            value={{
                DamFile: {
                    DependencyComponent: FileDependency,
                },
                ...rootEntities,
            }}
        >
            {children}
        </DependenciesConfigContext.Provider>
    );
};

export const useDependenciesConfig = (): DependencyRootEntities => {
    const context = React.useContext(DependenciesConfigContext);
    return context ?? {};
};

import * as React from "react";

import { DependencyComponent } from "./Dependency";

export interface DependencyRootEntities {
    [key: string]: {
        DependencyComponent: DependencyComponent;
    };
}

const DependenciesConfigContext = React.createContext<DependencyRootEntities | undefined>(undefined);

export const DependenciesConfigProvider: React.FunctionComponent<{ rootEntities: DependencyRootEntities }> = ({ children, rootEntities }) => {
    return <DependenciesConfigContext.Provider value={rootEntities}>{children}</DependenciesConfigContext.Provider>;
};

export const useDependenciesConfig = (): DependencyRootEntities => {
    const context = React.useContext(DependenciesConfigContext);
    return context ?? {};
};

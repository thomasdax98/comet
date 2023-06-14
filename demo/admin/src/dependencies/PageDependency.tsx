import { Dependency, DependencyComponentProps } from "@comet/cms-admin";
import { Page } from "@src/pages/Page";
import React from "react";

export const PageDependency = ({ id, dependencyData, contentScopeUrl }: DependencyComponentProps) => {
    return <Dependency id={id} DependencyClass={Page} graphqlVariables={{ id }} dependencyData={dependencyData} contentScopeUrl={contentScopeUrl} />;
};

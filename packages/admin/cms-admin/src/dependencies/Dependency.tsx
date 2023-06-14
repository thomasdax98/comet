import { useQuery } from "@apollo/client";
import { Link as LinkIcon, OpenNewTab as OpenNewTabIcon } from "@comet/admin-icons";
import { CircularProgress, IconButton, ListItemSecondaryAction, ListItemText } from "@mui/material";
import * as React from "react";
import { FormattedMessage } from "react-intl";
import { Link } from "react-router-dom";

import { DependencyInterface } from "../documents/types";
import { GQLDependency } from "../graphql.generated";

export interface DependencyComponentProps {
    id: string;
    dependencyData: Pick<GQLDependency, "rootGraphqlObjectType" | "rootId" | "rootColumnName" | "jsonPath">;
    contentScopeUrl: string;
}
export type DependencyComponent = (props: DependencyComponentProps) => React.ReactElement;

interface DependencyProps {
    id: string;
    DependencyClass: DependencyInterface;
    graphqlVariables: {
        [key: string]: unknown;
    };
    dependencyData: Pick<GQLDependency, "rootColumnName" | "jsonPath">;
    contentScopeUrl: string;
}

export const Dependency = ({ id, DependencyClass, graphqlVariables, dependencyData, contentScopeUrl }: DependencyProps) => {
    const { data, error, loading } = useQuery(DependencyClass.dependencyQuery, {
        variables: graphqlVariables,
    });

    if (error) {
        return (
            <FormattedMessage
                id="comet.dam.dependency.cannotResolveDependencyError"
                defaultMessage="Error: Cannot resolve this dependency. Type: {dependencyName}, ID: {id}."
                values={{
                    dependencyName: DependencyClass.displayName,
                    id: id,
                }}
            />
        );
    }

    if (data === undefined || loading) {
        return <CircularProgress />;
    }

    const url = DependencyClass.getUrl?.(data, { rootColumn: dependencyData.rootColumnName, jsonPath: dependencyData.jsonPath, contentScopeUrl });

    return (
        <>
            <ListItemText primary={DependencyClass.displayName} />
            <ListItemText primary={DependencyClass.getName(data)} secondary={DependencyClass.getSecondaryInformation?.(data)} />
            {!!url && (
                <ListItemSecondaryAction>
                    <IconButton component={Link} to={url}>
                        <LinkIcon />
                    </IconButton>
                    <IconButton component={Link} to={url} target="_blank">
                        <OpenNewTabIcon />
                    </IconButton>
                </ListItemSecondaryAction>
            )}
        </>
    );
};

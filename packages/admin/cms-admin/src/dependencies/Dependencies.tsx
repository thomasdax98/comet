import { ApolloError } from "@apollo/client";
import { OperationVariables } from "@apollo/client/core";
import { ApolloQueryResult } from "@apollo/client/core/types";
import { BallTriangle as BallTriangleIcon, Reload as ReloadIcon } from "@comet/admin-icons";
import { Button, List, ListItem, ListItemIcon } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import * as React from "react";
import { FormattedMessage } from "react-intl";

import { useContentScope } from "../contentScope/Provider";
import { GQLDependency } from "../graphql.generated";
import { useDependenciesConfig } from "./DependenciesConfig";
import { DependencyComponent } from "./Dependency";

const useStyles = makeStyles((theme) => ({
    list: {
        backgroundColor: theme.palette.background.paper,
    },
    listItem: {
        minHeight: 61,
    },
    listItemHeader: {
        display: "flex",
        justifyContent: "flex-end",
    },
    listItemIcon: {
        display: "flex",
        justifyContent: "center",
    },
    listItemLoadingIcon: {
        fontSize: 32,
        margin: theme.spacing(2, 0),
    },
}));

interface DependenciesProps {
    loading: boolean;
    error: ApolloError | undefined;
    refetch: (variables?: Partial<OperationVariables>) => Promise<ApolloQueryResult<unknown>>;
    dependencyItems: Array<Pick<GQLDependency, "rootGraphqlObjectType" | "rootId" | "rootColumnName" | "jsonPath">> | undefined;
}

export const Dependencies = ({ loading, error, refetch, dependencyItems }: DependenciesProps) => {
    const classes = useStyles();
    const dependenciesConfig = useDependenciesConfig();
    const contentScope = useContentScope();

    return (
        <List className={classes.list} disablePadding>
            <ListItem key="refresh" className={classes.listItemHeader} divider>
                <Button size="small" endIcon={<ReloadIcon />} onClick={() => refetch()} color="info">
                    <FormattedMessage id="comet.dam.dependencies.refresh" defaultMessage="Refresh" />
                </Button>
            </ListItem>
            {dependencyItems?.map((item) => {
                const DependencyComponent: DependencyComponent | undefined = dependenciesConfig[item.rootGraphqlObjectType]?.DependencyComponent;

                if (DependencyComponent === undefined) {
                    return (
                        <FormattedMessage
                            key={`${item.rootId}|${item.jsonPath}`}
                            id="comet.dam.dependencies.missingDependencyComponent"
                            defaultMessage="Error: Missing DependencyComponent for type {graphqlObjectType}. ID: {id}."
                            values={{
                                graphqlObjectType: item.rootGraphqlObjectType,
                                id: item.rootId,
                            }}
                        />
                    );
                }

                return (
                    <ListItem key={`${item.rootId}|${item.jsonPath}`} className={classes.listItem} divider>
                        <DependencyComponent id={item.rootId} dependencyData={item} contentScopeUrl={contentScope.match.url} />
                    </ListItem>
                );
            })}
            {loading && (
                <ListItem key="loading" className={classes.listItemIcon} divider>
                    <ListItemIcon>
                        <BallTriangleIcon className={classes.listItemLoadingIcon} />
                    </ListItemIcon>
                </ListItem>
            )}
        </List>
    );
};

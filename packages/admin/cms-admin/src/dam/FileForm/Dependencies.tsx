import { gql, useQuery } from "@apollo/client";
import { BallTriangle as BallTriangleIcon, Reload as ReloadIcon } from "@comet/admin-icons";
import { Button, List, ListItem, ListItemIcon } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import * as React from "react";
import { FormattedMessage } from "react-intl";

import { useContentScope } from "../../contentScope/Provider";
import { useDependenciesConfig } from "../../dependencies/DependenciesConfig";
import { GQLDamFileDependentsQuery, GQLDamFileDependentsQueryVariables } from "./Dependencies.generated";

export const damFileDetailDependencyFragment = gql`
    fragment DamFileDetailDependency on Dependency {
        rootGraphqlObjectType
        rootId
        rootColumnName
        jsonPath
    }
`;

const damFileDependentsQuery = gql`
    query DamFileDependents($id: ID!) {
        damFile(id: $id) {
            id
            dependents {
                ...DamFileDetailDependency
            }
        }
    }
    ${damFileDetailDependencyFragment}
`;

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
    fileId: string;
}

export const Dependencies = ({ fileId }: DependenciesProps) => {
    const classes = useStyles();
    const dependenciesConfig = useDependenciesConfig();
    const contentScope = useContentScope();

    const { data, loading, refetch } = useQuery<GQLDamFileDependentsQuery, GQLDamFileDependentsQueryVariables>(damFileDependentsQuery, {
        variables: {
            id: fileId,
        },
    });

    return (
        <List className={classes.list} disablePadding>
            <ListItem key="refresh" className={classes.listItemHeader} divider>
                <Button size="small" endIcon={<ReloadIcon />} onClick={() => refetch()} color="info">
                    <FormattedMessage id="comet.dam.dependencies.refresh" defaultMessage="Refresh" />
                </Button>
            </ListItem>
            {data?.damFile.dependents.map((dependent) => {
                const DependencyComponent = dependenciesConfig[dependent.rootGraphqlObjectType]?.DependencyComponent;

                if (DependencyComponent === undefined) {
                    return (
                        <FormattedMessage
                            key={`${dependent.rootId}|${dependent.jsonPath}`}
                            id="comet.dam.dependencies.missingDependencyComponent"
                            defaultMessage="Error: Missing DependencyComponent for type {graphqlObjectType}."
                            values={{
                                graphqlObjectType: dependent.rootGraphqlObjectType,
                            }}
                        />
                    );
                }

                return (
                    <ListItem key={`${dependent.rootId}|${dependent.jsonPath}`} className={classes.listItem} divider>
                        <DependencyComponent id={dependent.rootId} dependencyData={dependent} contentScopeUrl={contentScope.match.url} />
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

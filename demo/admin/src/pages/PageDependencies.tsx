import { gql, useQuery } from "@apollo/client";
import { DependencyList } from "@comet/cms-admin";
import { GQLPageDependenciesQuery, GQLPageDependenciesQueryVariables } from "@src/pages/PageDependencies.generated";
import * as React from "react";

const pageDependenciesQuery = gql`
    query PageDependencies($id: ID!) {
        page(id: $id) {
            id
            dependencies {
                targetGraphqlObjectType
                targetId
                rootColumnName
                jsonPath
            }
        }
    }
`;

interface PageDependenciesProps {
    pageId: string;
}

export const PageDependencies = ({ pageId }: PageDependenciesProps) => {
    const { data, loading, error, refetch } = useQuery<GQLPageDependenciesQuery, GQLPageDependenciesQueryVariables>(pageDependenciesQuery, {
        variables: {
            id: pageId,
        },
    });

    return (
        <DependencyList
            loading={loading}
            error={error}
            refetch={refetch}
            dependencyItems={data?.page.dependencies.map((dependency) => {
                return {
                    ...dependency,
                    id: dependency.targetId,
                    graphqlObjectType: dependency.targetGraphqlObjectType,
                };
            })}
        />
    );
};

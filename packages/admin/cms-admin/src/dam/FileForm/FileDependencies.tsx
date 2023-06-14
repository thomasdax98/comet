import { gql, useQuery } from "@apollo/client";
import * as React from "react";

import { Dependencies } from "../../dependencies/Dependencies";
import { GQLDamFileDependentsQuery, GQLDamFileDependentsQueryVariables } from "./FileDependencies.generated";

const damFileDependentsQuery = gql`
    query DamFileDependents($id: ID!) {
        damFile(id: $id) {
            id
            dependents {
                rootGraphqlObjectType
                rootId
                rootColumnName
                jsonPath
            }
        }
    }
`;

interface DependenciesProps {
    fileId: string;
}

export const FileDependencies = ({ fileId }: DependenciesProps) => {
    const { data, loading, error, refetch } = useQuery<GQLDamFileDependentsQuery, GQLDamFileDependentsQueryVariables>(damFileDependentsQuery, {
        variables: {
            id: fileId,
        },
    });

    return <Dependencies loading={loading} error={error} refetch={refetch} dependencyItems={data?.damFile.dependents} />;
};

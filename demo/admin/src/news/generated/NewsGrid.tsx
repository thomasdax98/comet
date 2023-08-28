// This file has been generated by comet admin-generator.
// You may choose to use this file as scaffold by moving this file out of generated folder and removing this comment.
import { useApolloClient, useQuery } from "@apollo/client";
import {
    CrudContextMenu,
    GridFilterButton,
    muiGridFilterToGql,
    muiGridSortToGql,
    StackLink,
    Toolbar,
    ToolbarAutomaticTitleItem,
    ToolbarFillSpace,
    ToolbarItem,
    useBufferedRowCount,
    useDataGridRemote,
    usePersistentColumnState,
} from "@comet/admin";
import { Add as AddIcon, Edit } from "@comet/admin-icons";
import { BlockPreviewContent } from "@comet/blocks-admin";
import { DamImageBlock } from "@comet/cms-admin";
import { Box, Button, IconButton } from "@mui/material";
import { DataGridPro, GridColDef, GridToolbarQuickFilter } from "@mui/x-data-grid-pro";
import { useContentScope } from "@src/common/ContentScopeProvider";
import gql from "graphql-tag";
import * as React from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { NewsContentBlock } from "../blocks/NewsContentBlock";
import {
    GQLCreateNewsMutation,
    GQLCreateNewsMutationVariables,
    GQLDeleteNewsMutation,
    GQLDeleteNewsMutationVariables,
    GQLNewsGridQuery,
    GQLNewsGridQueryVariables,
    GQLNewsListFragment,
} from "./NewsGrid.generated";

const newsFragment = gql`
    fragment NewsList on News {
        id
        updatedAt
        slug
        title
        date
        category
        visible
        image
        content
        createdAt
    }
`;

const newsQuery = gql`
    query NewsGrid($offset: Int, $limit: Int, $sort: [NewsSort!], $search: String, $filter: NewsFilter, $scope: NewsContentScopeInput!) {
        newsList(offset: $offset, limit: $limit, sort: $sort, search: $search, filter: $filter, scope: $scope) {
            nodes {
                ...NewsList
            }
            totalCount
        }
    }
    ${newsFragment}
`;

const deleteNewsMutation = gql`
    mutation DeleteNews($id: ID!) {
        deleteNews(id: $id)
    }
`;

const createNewsMutation = gql`
    mutation CreateNews($scope: NewsContentScopeInput!, $input: NewsInput!) {
        createNews(scope: $scope, input: $input) {
            id
        }
    }
`;

function NewsGridToolbar() {
    return (
        <Toolbar>
            <ToolbarAutomaticTitleItem />
            <ToolbarItem>
                <GridToolbarQuickFilter />
            </ToolbarItem>
            <ToolbarFillSpace />
            <ToolbarItem>
                <GridFilterButton />
            </ToolbarItem>
            <ToolbarItem>
                <Button startIcon={<AddIcon />} component={StackLink} pageName="add" payload="add" variant="contained" color="primary">
                    <FormattedMessage id="news.newNews" defaultMessage="New News" />
                </Button>
            </ToolbarItem>
        </Toolbar>
    );
}

export function NewsGrid(): React.ReactElement {
    const client = useApolloClient();
    const intl = useIntl();
    const dataGridProps = { ...useDataGridRemote(), ...usePersistentColumnState("NewsGrid") };
    const { scope } = useContentScope();

    const columns: GridColDef<GQLNewsListFragment>[] = [
        {
            field: "updatedAt",
            headerName: intl.formatMessage({ id: "news.updatedAt", defaultMessage: "Updated At" }),
            type: "dateTime",
            valueGetter: ({ value }) => value && new Date(value),
            width: 150,
        },
        { field: "slug", headerName: intl.formatMessage({ id: "news.slug", defaultMessage: "Slug" }), width: 150 },
        { field: "title", headerName: intl.formatMessage({ id: "news.title", defaultMessage: "Title" }), width: 150 },
        {
            field: "date",
            headerName: intl.formatMessage({ id: "news.date", defaultMessage: "Date" }),
            type: "dateTime",
            valueGetter: ({ value }) => value && new Date(value),
            width: 150,
        },
        {
            field: "category",
            headerName: intl.formatMessage({ id: "news.category", defaultMessage: "Category" }),
            type: "singleSelect",
            valueOptions: [
                { value: "Events", label: intl.formatMessage({ id: "news.category.events", defaultMessage: "Events" }) },
                { value: "Company", label: intl.formatMessage({ id: "news.category.company", defaultMessage: "Company" }) },
                { value: "Awards", label: intl.formatMessage({ id: "news.category.awards", defaultMessage: "Awards" }) },
            ],
            width: 150,
        },
        { field: "visible", headerName: intl.formatMessage({ id: "news.visible", defaultMessage: "Visible" }), type: "boolean", width: 150 },
        {
            field: "image",
            headerName: intl.formatMessage({ id: "news.image", defaultMessage: "Image" }),
            filterable: false,
            sortable: false,
            width: 150,
            renderCell: (params) => {
                return <BlockPreviewContent block={DamImageBlock} input={params.row.image} />;
            },
        },
        {
            field: "content",
            headerName: intl.formatMessage({ id: "news.content", defaultMessage: "Content" }),
            filterable: false,
            sortable: false,
            width: 150,
            renderCell: (params) => {
                return <BlockPreviewContent block={NewsContentBlock} input={params.row.content} />;
            },
        },
        {
            field: "createdAt",
            headerName: intl.formatMessage({ id: "news.createdAt", defaultMessage: "Created At" }),
            type: "dateTime",
            valueGetter: ({ value }) => value && new Date(value),
            width: 150,
        },
        {
            field: "actions",
            headerName: "",
            sortable: false,
            filterable: false,
            type: "actions",
            renderCell: (params) => {
                return (
                    <>
                        <IconButton component={StackLink} pageName="edit" payload={params.row.id}>
                            <Edit color="primary" />
                        </IconButton>
                        <CrudContextMenu
                            copyData={() => {
                                const row = params.row;
                                return {
                                    slug: row.slug,
                                    title: row.title,
                                    date: row.date,
                                    category: row.category,
                                    image: DamImageBlock.state2Output(DamImageBlock.input2State(row.image)),
                                    content: NewsContentBlock.state2Output(NewsContentBlock.input2State(row.content)),
                                };
                            }}
                            onPaste={async ({ input }) => {
                                await client.mutate<GQLCreateNewsMutation, GQLCreateNewsMutationVariables>({
                                    mutation: createNewsMutation,
                                    variables: { scope, input },
                                });
                            }}
                            onDelete={async () => {
                                await client.mutate<GQLDeleteNewsMutation, GQLDeleteNewsMutationVariables>({
                                    mutation: deleteNewsMutation,
                                    variables: { id: params.row.id },
                                });
                            }}
                            refetchQueries={[newsQuery]}
                        />
                    </>
                );
            },
        },
    ];

    const { filter: gqlFilter, search: gqlSearch } = muiGridFilterToGql(columns, dataGridProps.filterModel);

    const { data, loading, error } = useQuery<GQLNewsGridQuery, GQLNewsGridQueryVariables>(newsQuery, {
        variables: {
            scope,
            filter: gqlFilter,
            search: gqlSearch,
            offset: dataGridProps.page * dataGridProps.pageSize,
            limit: dataGridProps.pageSize,
            sort: muiGridSortToGql(dataGridProps.sortModel),
        },
    });
    const rowCount = useBufferedRowCount(data?.newsList.totalCount);
    if (error) throw error;
    const rows = data?.newsList.nodes ?? [];

    return (
        <Box sx={{ height: `calc(100vh - var(--comet-admin-master-layout-content-top-spacing))` }}>
            <DataGridPro
                {...dataGridProps}
                disableSelectionOnClick
                rows={rows}
                rowCount={rowCount}
                columns={columns}
                loading={loading}
                components={{
                    Toolbar: NewsGridToolbar,
                }}
            />
        </Box>
    );
}
import { Injectable } from "@nestjs/common";

import { DamItemEdge, DamItemsArgs, PaginatedDamItems } from "./dto/dam-items.args";
import { PaginatedDamFiles } from "./files.resolver";
import { FilesService } from "./files.service";
import { PaginatedDamFolders } from "./folders.resolver";
import { FoldersService } from "./folders.service";

@Injectable()
export class DamItemsService {
    constructor(private readonly foldersService: FoldersService, private readonly filesService: FilesService) {}

    async findPaginated({
        folderId,
        includeArchived,
        filter,
        sortColumnName,
        sortDirection,
        first,
        after,
        last,
        before,
    }: DamItemsArgs): Promise<PaginatedDamItems> {
        let folders: PaginatedDamFolders | undefined;
        let files: PaginatedDamFiles | undefined;
        if (first && (after === undefined || after.type === "folder")) {
            folders = await this.foldersService.findPaginated({
                parentId: folderId,
                includeArchived,
                filter: { searchText: filter?.searchText },
                sortDirection,
                sortColumnName,
                first,
                after: after?.id,
            });

            if (folders.edges.length < first) {
                first = first - folders.edges.length;
                after = undefined;

                files = await this.filesService.findPaginated({
                    folderId,
                    includeArchived,
                    filter: { searchText: filter?.searchText, mimetypes: filter?.mimetypes },
                    sortColumnName,
                    sortDirection,
                    first,
                    after,
                });
            }
        } else if (first && after?.type === "file") {
            files = await this.filesService.findPaginated({
                folderId,
                includeArchived,
                filter: { searchText: filter?.searchText, mimetypes: filter?.mimetypes },
                sortColumnName,
                sortDirection,
                first,
                after: after.id,
            });
        } else if (last && before?.type === "folder") {
            folders = await this.foldersService.findPaginated({
                parentId: folderId,
                includeArchived,
                filter: { searchText: filter?.searchText },
                sortDirection,
                sortColumnName,
                last,
                before: before.id,
            });
        } else if (last && (before === undefined || before.type === "file")) {
            files = await this.filesService.findPaginated({
                folderId,
                includeArchived,
                filter: { searchText: filter?.searchText, mimetypes: filter?.mimetypes },
                sortColumnName,
                sortDirection,
                last,
                before: before?.id,
            });

            if (files.edges.length < last) {
                last = last - files.edges.length;
                before = undefined;

                folders = await this.foldersService.findPaginated({
                    parentId: folderId,
                    includeArchived,
                    filter: { searchText: filter?.searchText },
                    sortDirection,
                    sortColumnName,
                    last,
                    before: before,
                });
            }
        } else {
            throw new Error("No cursor provided");
        }

        let hasNextPage: boolean;
        let hasPreviousPage: boolean;

        hasPreviousPage = !!(folders?.pageInfo.hasPreviousPage || files?.pageInfo.hasPreviousPage);
        hasNextPage = !!(folders?.pageInfo.hasNextPage || files?.pageInfo.hasNextPage);

        if (!folders && !hasPreviousPage) {
            const [, folderCount] = await this.foldersService.findAndCount({
                parentId: folderId,
                includeArchived,
                filter,
                sortColumnName,
                sortDirection,
            });
            hasPreviousPage = folderCount > 0;
        }

        if (!files && !hasNextPage) {
            const [, fileCount] = await this.filesService.findAndCount({ folderId, includeArchived, filter, sortColumnName, sortDirection });
            hasNextPage = fileCount > 0;
        }

        const edges: DamItemEdge[] = [];
        if (folders) {
            for (const folderEdge of folders.edges) {
                edges.push({
                    node: folderEdge.node,
                    cursor: {
                        type: "folder",
                        id: folderEdge.cursor,
                    },
                });
            }
        }
        if (files) {
            for (const fileEdge of files.edges) {
                edges.push({
                    node: fileEdge.node,
                    cursor: {
                        type: "file",
                        id: fileEdge.cursor,
                    },
                });
            }
        }

        return new PaginatedDamItems(edges, {
            startCursor: edges.length > 0 ? edges[0].cursor : null,
            endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
            hasNextPage: hasNextPage,
            hasPreviousPage: hasPreviousPage,
        });
    }
}

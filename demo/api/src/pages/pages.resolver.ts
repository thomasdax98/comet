import {
    getSortAndOffsetBasedPaginatedOptions,
    OffsetBasedPaginationArgs,
    PageTreeNodeInterface,
    PageTreeNodeVisibility,
    PageTreeService,
    validateNotModified,
} from "@comet/cms-api";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/postgresql";
import { UnauthorizedException } from "@nestjs/common";
import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { PageTreeNode } from "@src/page-tree/entities/page-tree-node.entity";

import { PageInput } from "./dto/page.input";
import { PaginatedPages } from "./dto/paginated-pages";
import { Page } from "./entities/page.entity";

@Resolver(() => Page)
export class PagesResolver {
    constructor(@InjectRepository(Page) private readonly repository: EntityRepository<Page>, private readonly pageTreeService: PageTreeService) {}

    @Query(() => Page, { nullable: true })
    async page(@Args("pageId", { type: () => ID }) pageId: string): Promise<Page | null> {
        return this.repository.findOne(pageId);
    }

    @Query(() => PaginatedPages)
    async pages(@Args() args: OffsetBasedPaginationArgs): Promise<PaginatedPages> {
        const { offset, limit, orderBy } = getSortAndOffsetBasedPaginatedOptions(args);

        const [pages, totalCount] = await this.repository.findAndCount({}, { offset, limit, orderBy });

        return new PaginatedPages(pages, totalCount, args);
    }

    @ResolveField(() => PageTreeNode, { nullable: true })
    async pageTreeNode(@Parent() page: Page): Promise<PageTreeNodeInterface | null> {
        return await this.pageTreeService.createReadApi().getFirstNodeByAttachedPageId(page.id);
    }

    @Mutation(() => Page)
    async savePage(
        @Args("pageId", { type: () => ID }) pageId: string,
        @Args("input", { type: () => PageInput }) input: PageInput,
        @Args("lastUpdatedAt", { type: () => Date, nullable: true }) lastUpdatedAt?: Date,
        @Args("attachedPageTreeNodeId", { nullable: true, type: () => ID }) attachedPageTreeNodeId?: string,
    ): Promise<Page | null> {
        // all pageTypes need this is-archived-page-check
        // TODO: maybe implemented in a base-(document|page)-service which lives in @comet/cms-api
        if (attachedPageTreeNodeId) {
            const pageTreeNode = await this.pageTreeService.createReadApi({ visibility: "all" }).getNodeOrFail(attachedPageTreeNodeId);
            if (pageTreeNode.visibility === PageTreeNodeVisibility.Archived) {
                throw new UnauthorizedException("Archived pages cannot be updated");
            }
        }

        let page = await this.repository.findOne(pageId);

        if (page) {
            if (lastUpdatedAt) {
                validateNotModified(page, lastUpdatedAt);
            }

            page.assign({
                content: input.content.transformToBlockData(),
                seo: input.seo.transformToBlockData(),
            });
        } else {
            page = this.repository.create({
                id: pageId,
                content: input.content.transformToBlockData(),
                seo: input.seo.transformToBlockData(),
            });

            this.repository.persist(page);
        }

        if (attachedPageTreeNodeId) {
            await this.pageTreeService.attachDocument({ id: pageId, type: "Page" }, attachedPageTreeNodeId);
        }

        await this.repository.flush();

        return page;
    }
}

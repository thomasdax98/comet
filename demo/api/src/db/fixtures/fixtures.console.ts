import { BlobStorageBackendService, FilesService, PageTreeNodeInterface, PageTreeNodeVisibility, PageTreeService } from "@comet/cms-api";
import { MikroORM, UseRequestContext } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/postgresql";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { configNS } from "@src/config/config.namespace";
import { generateSeoBlock } from "@src/db/fixtures/generators/blocks/seo.generator";
import { Link } from "@src/links/entities/link.entity";
import { PageTreeNodeScope } from "@src/page-tree/dto/page-tree-node-scope";
import { PageTreeNodeCategory } from "@src/page-tree/page-tree-node-category";
import { PageContentBlock } from "@src/pages/blocks/PageContentBlock";
import { PageInput } from "@src/pages/dto/page.input";
import { Page } from "@src/pages/entities/page.entity";
import faker from "faker";
import { Command, Console } from "nestjs-console";

import { generateLinks } from "./generators/links.generator";
import { ManyImagesTestPageGenerator } from "./generators/many-images-test-page.generator";

export interface PageTreeNodesFixtures {
    home?: PageTreeNodeInterface;
    sub?: PageTreeNodeInterface;
    test2?: PageTreeNodeInterface;
    test3?: PageTreeNodeInterface;
    link1?: PageTreeNodeInterface;
    testSiteVisibility?: PageTreeNodeInterface;
}

const getDefaultPageInput = (): PageInput => {
    const pageInput = new PageInput();
    pageInput.seo = generateSeoBlock();
    pageInput.content = PageContentBlock.blockInputFactory({ blocks: [] });
    return pageInput;
};

@Injectable()
@Console()
export class FixturesConsole {
    constructor(
        @Inject(configNS.KEY) private readonly config: ConfigType<typeof configNS>,
        private readonly blobStorageBackendService: BlobStorageBackendService,
        private readonly pageTreeService: PageTreeService,
        private readonly filesService: FilesService,
        private readonly orm: MikroORM,
        @InjectRepository(Page) private readonly pagesRepository: EntityRepository<Page>,
        @InjectRepository(Link) private readonly linksRepository: EntityRepository<Link>,
    ) {}

    @Command({
        command: "fixtures",
        description: "Create fixtures with faker.js",
    })
    @UseRequestContext()
    async execute(): Promise<void> {
        const pageTreeNodes: PageTreeNodesFixtures = {};
        // ensure repeatable runs
        faker.seed(123456);

        const damFilesDirectory = `${this.config.BLOB_STORAGE_DIRECTORY_PREFIX}-files`;
        if (await this.blobStorageBackendService.folderExists(damFilesDirectory)) {
            await this.blobStorageBackendService.removeFolder(damFilesDirectory);
        }
        await this.blobStorageBackendService.createFolder(damFilesDirectory);
        console.log("Storage cleared");

        const generator = this.orm.getSchemaGenerator();
        console.log(`Drop and recreate schema...`);
        await generator.dropSchema({ dropDb: false, dropMigrationsTable: true });

        console.log(`Run migrations...`);
        const migrator = this.orm.getMigrator();
        await migrator.up();

        const scope: PageTreeNodeScope = {
            domain: "main",
            language: "en",
        };

        const attachedDocumentIds = [
            "b0bf3927-e080-4d4e-997b-d7f18b051e0f",
            "4ff8707a-4bb7-45ab-b06d-72a3e94286c7",
            "729c37f5-c28b-45d4-88a8-a89abc579c07",
            "46ce964c-f029-46f0-9961-ef436e2391f2",
            "dc956c9a-729b-4d8e-9ed4-f1be1dad6dd3",
        ];

        let node = await this.pageTreeService.createNode(
            {
                name: "Home",
                slug: "home",
                attachedDocument: {
                    id: attachedDocumentIds[0],
                    type: "Page",
                },
            },
            PageTreeNodeCategory.MainNavigation,
            scope,
        );
        pageTreeNodes.home = node;

        await this.pageTreeService.updateNodeVisibility(node.id, PageTreeNodeVisibility.Published);

        node = await this.pageTreeService.createNode(
            { name: "Sub", slug: "sub", parentId: node.id, attachedDocument: { id: attachedDocumentIds[1], type: "Page" } },
            PageTreeNodeCategory.MainNavigation,
            scope,
        );
        pageTreeNodes.sub = node;

        await this.pageTreeService.updateNodeVisibility(node.id, PageTreeNodeVisibility.Published);

        node = await this.pageTreeService.createNode(
            {
                name: "Test 2",
                slug: "test2",
                attachedDocument: {
                    id: attachedDocumentIds[2],
                    type: "Page",
                },
            },
            PageTreeNodeCategory.MainNavigation,
            scope,
        );
        pageTreeNodes.test2 = node;

        await this.pageTreeService.updateNodeVisibility(node.id, PageTreeNodeVisibility.Published);

        node = await this.pageTreeService.createNode(
            {
                name: "Test 3",
                slug: "test3",
                attachedDocument: {
                    type: "Page",
                },
            },
            PageTreeNodeCategory.MainNavigation,
            scope,
        );
        pageTreeNodes.test3 = node;

        await this.pageTreeService.updateNodeVisibility(node.id, PageTreeNodeVisibility.Published);

        node = await this.pageTreeService.createNode(
            {
                name: "Link1",
                slug: "link",
                attachedDocument: {
                    id: attachedDocumentIds[3],
                    type: "Link",
                },
            },
            PageTreeNodeCategory.MainNavigation,
            scope,
        );
        pageTreeNodes.link1 = node;

        await this.pageTreeService.updateNodeVisibility(node.id, PageTreeNodeVisibility.Published);

        node = await this.pageTreeService.createNode(
            {
                name: "Test Site visibility",
                slug: "test-site-visibility",
                attachedDocument: {
                    id: attachedDocumentIds[4],
                    type: "Page",
                },
            },
            PageTreeNodeCategory.MainNavigation,
            scope,
        );
        pageTreeNodes.testSiteVisibility = node;

        await this.pageTreeService.updateNodeVisibility(node.id, PageTreeNodeVisibility.Published);

        for (const attachedDocumentId of attachedDocumentIds) {
            const pageInput = getDefaultPageInput();

            await this.pagesRepository.persistAndFlush(
                this.pagesRepository.create({
                    id: attachedDocumentId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    content: pageInput.content.transformToBlockData(),
                    seo: pageInput.seo.transformToBlockData(),
                }),
            );
        }

        console.log("generate links");
        await generateLinks(this.linksRepository, pageTreeNodes);
        console.log("links generated");

        console.log("generate many images test page");
        const manyImagesTestGenerator = new ManyImagesTestPageGenerator(this.pageTreeService, this.filesService, this.pagesRepository);
        await manyImagesTestGenerator.execute();
        console.log("many images test page created");
    }
}
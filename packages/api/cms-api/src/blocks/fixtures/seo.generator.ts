import { ExtractBlockInput } from "@comet/blocks-api";
import * as faker from "faker";

import { createSeoBlock, SitemapPageChangeFrequency, SitemapPagePriority } from "../createSeoBlock";

const SeoBlock = createSeoBlock();

export const generateSeoBlock = (): ExtractBlockInput<typeof SeoBlock> => {
    const alternativeLinks = [];
    const codes = ["en_US", "en_GB", "es_ES", "fr_FR", "ja_JP", "it_IT"];
    for (let i = 0; i < faker.datatype.number({ min: 0, max: 5 }); i++) {
        alternativeLinks.push({ code: codes[i], url: faker.internet.url() });
    }

    return SeoBlock.blockInputFactory({
        htmlTitle: faker.random.words(2),
        metaDescription: faker.random.words(20),
        openGraphTitle: faker.random.words(2),
        openGraphDescription: faker.random.words(20),
        openGraphImage: { block: undefined, visible: false },
        noIndex: faker.datatype.boolean(),
        priority: faker.random.arrayElement(Object.values(SitemapPagePriority)),
        changeFrequency: faker.random.arrayElement(Object.values(SitemapPageChangeFrequency)),
        alternativeLinks,
        structuredData: JSON.stringify({ name: faker.random.words(2), description: faker.random.words(20), datePublished: faker.date.past() }),
    });
};

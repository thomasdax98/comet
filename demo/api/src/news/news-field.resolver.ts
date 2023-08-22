import { DependenciesService } from "@comet/cms-api";
import { DependenciesAndDependentsResolver } from "@comet/cms-api/lib/dependencies/dependencies.resolver";
import { Parent, ResolveField, Resolver } from "@nestjs/graphql";

import { News } from "./entities/news.entity";
import { NewsComment } from "./entities/news-comment.entity";

@Resolver(() => News)
export class NewsFieldResolver extends DependenciesAndDependentsResolver(News) {
    constructor(private readonly dependenciesService: DependenciesService) {
        super(dependenciesService);
    }

    @ResolveField(() => [NewsComment])
    async comments(@Parent() news: News): Promise<NewsComment[]> {
        return news.comments.loadItems();
    }
}

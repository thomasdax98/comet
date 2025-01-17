import { Field, ID, ObjectType } from "@nestjs/graphql";

import { LABEL_ANNOTATION } from "../builds.constants";

@ObjectType("BuildTemplate")
export class BuildTemplateObject {
    @Field(() => ID)
    id: string;

    @Field()
    name: string;

    @Field({ nullable: true, description: `Human readable label provided by ${LABEL_ANNOTATION} annotation. Use name as fallback if not present` })
    label?: string;
}

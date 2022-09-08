import { GQLUserGroup } from "@src/graphql.generated";

const userGroupAdditionalItemFields: { userGroup: { defaultValue: GQLUserGroup } } = {
    userGroup: {
        defaultValue: "All",
    },
};

export { userGroupAdditionalItemFields };

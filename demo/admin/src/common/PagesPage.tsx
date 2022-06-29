import { gql } from "@apollo/client";
import { Field, FinalFormSelect } from "@comet/admin";
import { AllCategories, createEditPageNode, PagesPage as CometPagesPage } from "@comet/cms-admin";
import { MenuItem } from "@mui/material";
import { Link } from "@src/links/Link";
import { Page } from "@src/pages/Page";
import * as React from "react";
import { FormattedMessage } from "react-intl";

interface PagesPageProps {
    allCategories: AllCategories;
}

const userGroupOptions = [
    {
        label: "Show for all",
        value: "All",
    },
    {
        label: "Show only for Group: User",
        value: "User",
    },
    {
        label: "Show only for Group: Admin",
        value: "Admin",
    },
];

export const additionalPageTreeNodeFieldsFragment = gql`
    fragment PageTreeNodeAdditionalFields on PageTreeNode {
        userGroup
    }
`;

const EditPageNode = createEditPageNode({
    valuesToInput: ({ values }: { values: { userGroup: string } }) => {
        return {
            userGroup: values.userGroup,
        };
    },
    nodeFragment: {
        name: "PageTreeNodeAdditionalFields",
        fragment: additionalPageTreeNodeFieldsFragment,
    },
    formFields: (
        <div>
            <Field label={<FormattedMessage id="cometDemo.pageTreeNode.fields.userGroup" defaultMessage="User-Group" />} name="userGroup" fullWidth>
                {(props) => (
                    <FinalFormSelect {...props} fullWidth>
                        {userGroupOptions.map((option) => (
                            <MenuItem value={option.value} key={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </FinalFormSelect>
                )}
            </Field>
        </div>
    ),
});

const PagesPage: React.FunctionComponent<PagesPageProps> = ({ allCategories }) => {
    return (
        <CometPagesPage
            category="MainNavigation"
            allCategories={allCategories}
            path="/pages/pagetree/main-navigation"
            documentTypes={{ Page, Link }}
            editPageNode={EditPageNode}
        />
    );
};

export default PagesPage;

import { createListBlock, ExtractAdditionalItemFields } from "@comet/blocks-admin";
import { LinkListBlockData } from "@src/blocks.generated";
import { userGroupAdditionalItemFields } from "@src/userGroups/userGroupAdditionalItemFields";
import { UserGroupChip } from "@src/userGroups/UserGroupChip";
import { UserGroupContextMenuItem } from "@src/userGroups/UserGroupContextMenuItem";
import * as React from "react";
import { FormattedMessage } from "react-intl";

import { TextLinkBlock } from "./TextLinkBlock";

export const LinkListBlock = createListBlock<typeof TextLinkBlock, ExtractAdditionalItemFields<LinkListBlockData>>({
    name: "LinkList",
    block: TextLinkBlock,
    displayName: <FormattedMessage id="cometDemo.blocks.linkList.displayName" defaultMessage="Link list" />,
    itemName: <FormattedMessage id="cometDemo.blocks.linkList.itemName" defaultMessage="link" />,
    itemsName: <FormattedMessage id="cometDemo.blocks.linkList.itemsName" defaultMessage="links" />,
    additionalItemFields: {
        ...userGroupAdditionalItemFields,
    },
    AdditionalItemContextMenuItems: ({ item, onChange, onMenuClose }) => {
        return <UserGroupContextMenuItem item={item} onChange={onChange} onMenuClose={onMenuClose} />;
    },
    AdditionalItemContent: ({ item }) => {
        return <UserGroupChip item={item} />;
    },
});

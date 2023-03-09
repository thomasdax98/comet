import { useApolloClient } from "@apollo/client";
import { Archive, Delete, Error as ErrorIcon, MoreVertical, Move, Restore, ThreeDotSaving } from "@comet/admin-icons";
import { Divider, IconButton as CometAdminIconButton, IconButton, Tooltip, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { GraphQLError } from "graphql";
import * as React from "react";
import { FormattedMessage } from "react-intl";

import { clearDamItemCache } from "../../helpers/clearDamItemCache";
import { DamMoreActions } from "../selection/DamMoreActions";
import { useDamSelectionApi } from "../selection/DamSelectionContext";
import { DamFooter } from "./DamFooter";

const ButtonGroup = styled("div")`
    display: flex;
    gap: 10px;
`;

const StyledErrorIcon = styled(ErrorIcon)`
    color: ${({ theme }) => theme.palette.error.main};
`;

interface DamSelectionFooterProps {
    open: boolean;
}

export const DamSelectionFooter: React.VoidFunctionComponent<DamSelectionFooterProps> = ({ open }) => {
    const damSelectionActionsApi = useDamSelectionApi();

    if (!open) {
        return null;
    }

    return (
        <DamFooter open={open}>
            <Typography>
                <FormattedMessage
                    id="comet.dam.footer.selected"
                    defaultMessage="{count, plural, one {# item} other {# items}} selected"
                    values={{
                        count: damSelectionActionsApi.selectionMap.size,
                    }}
                />
            </Typography>
            <ButtonGroup>
                <FooterActionButton
                    title={<FormattedMessage id="comet.dam.footer.move" defaultMessage="Move" />}
                    onClick={() => {
                        damSelectionActionsApi.moveSelected();
                    }}
                    icon={<Move />}
                    loading={damSelectionActionsApi.moving}
                    hasErrors={damSelectionActionsApi.hasMoveErrors}
                />
                <FooterActionButton
                    title={<FormattedMessage id="comet.dam.footer.archive" defaultMessage="Archive" />}
                    onClick={() => {
                        damSelectionActionsApi.archiveSelected();
                    }}
                    icon={<Archive />}
                    loading={damSelectionActionsApi.archiving}
                    hasErrors={damSelectionActionsApi.hasArchiveErrors}
                />
                <FooterActionButton
                    title={<FormattedMessage id="comet.dam.footer.restore" defaultMessage="Restore" />}
                    onClick={() => {
                        damSelectionActionsApi.restoreSelected();
                    }}
                    icon={<Restore />}
                    loading={damSelectionActionsApi.restoring}
                    hasErrors={damSelectionActionsApi.hasRestoreErrors}
                />
                <FooterActionButton
                    title={<FormattedMessage id="comet.dam.footer.delete" defaultMessage="Delete" />}
                    onClick={() => {
                        damSelectionActionsApi.deleteSelected();
                    }}
                    icon={<Delete />}
                    loading={damSelectionActionsApi.deleting}
                    hasErrors={damSelectionActionsApi.hasDeletionErrors}
                />
                <Divider orientation="vertical" sx={{ borderColor: (theme) => theme.palette.grey.A200 }} flexItem={true} />
                <DamMoreActions
                    button={
                        <IconButton
                            sx={{
                                color: (theme) => theme.palette.grey.A100,
                            }}
                        >
                            <MoreVertical />
                        </IconButton>
                    }
                    // Button={({ onClick }) => {
                    //     return (
                    //         <IconButton
                    //             sx={{
                    //                 color: (theme) => theme.palette.grey.A100,
                    //             }}
                    //             onClick={onClick}
                    //         >
                    //             <MoreVertical />
                    //         </IconButton>
                    //     );
                    // }}
                />
            </ButtonGroup>
        </DamFooter>
    );
};

const StyledCometAdminIconButton = styled(CometAdminIconButton)`
    color: ${({ theme }) => theme.palette.grey.A100};
    padding-left: 4px;
    padding-right: 4px;
`;

interface IconButtonProps {
    title: NonNullable<React.ReactNode>;
    onClick?: () => void;
    executeMutation?: () => Promise<{ errors: readonly GraphQLError[] | undefined } | undefined>;
    icon: React.ReactNode;
    loading?: boolean;
    hasErrors?: boolean;
}

const FooterActionButton = ({ title, onClick, executeMutation, icon, loading: externalLoading, hasErrors: externalHasErrors }: IconButtonProps) => {
    const apolloClient = useApolloClient();

    const [internalLoading, setInternalLoading] = React.useState<boolean>(false);
    const [internalHasErrors, setInternalHasErrors] = React.useState<boolean>(false);

    const loading = externalLoading ?? internalLoading;
    const hasErrors = externalHasErrors ?? internalHasErrors;

    const handleClick = async () => {
        if (executeMutation === undefined) {
            throw new Error("FooterActionButton: You must either set onClick or executeMutation");
        }

        setInternalLoading(true);

        const result = await executeMutation();

        if (result) {
            if (result.errors) {
                setInternalHasErrors(true);
                setTimeout(() => {
                    setInternalHasErrors(false);
                }, 3000);
            } else {
                clearDamItemCache(apolloClient.cache);
            }
        }

        setInternalLoading(false);
    };

    return (
        <Tooltip title={title}>
            <StyledCometAdminIconButton onClick={onClick ?? handleClick} size="large">
                {loading ? <ThreeDotSaving /> : hasErrors ? <StyledErrorIcon /> : icon}
            </StyledCometAdminIconButton>
        </Tooltip>
    );
};

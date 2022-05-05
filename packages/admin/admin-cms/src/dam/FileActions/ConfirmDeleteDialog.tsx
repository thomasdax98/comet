import { CancelButton } from "@comet/admin";
import { Delete } from "@comet/admin-icons";
import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";
import React from "react";
import { FormattedMessage } from "react-intl";

import * as sc from "./ConfirmDeleteDialog.sc";

interface ConfirmDeleteDialogProps {
    open: boolean;
    onCloseDialog: (confirmed: boolean) => void;
    itemType: "file" | "folder" | "selected_items";
    name?: string;
}

export const ConfirmDeleteDialog = ({ open, onCloseDialog, name, itemType }: ConfirmDeleteDialogProps): React.ReactElement => {
    return (
        <Dialog open={open} onClose={() => onCloseDialog(false)}>
            <DialogTitle>
                <FormattedMessage id="dam.delete.deleteSelection" defaultMessage="Delete selection?" />
            </DialogTitle>
            <sc.ConfirmDialogContent>
                {/* @TODO: Only show warning if there are dependencies */}
                <sc.WarningWrapper>
                    <sc.WarningIcon />
                    <sc.WarningTextWrapper>
                        <sc.WarningHeading>
                            <FormattedMessage id="comet.generic.warning" defaultMessage="Warning" />
                        </sc.WarningHeading>
                        <sc.WarningText>
                            {itemType === "file" && (
                                <FormattedMessage
                                    id="dam.delete.file.mightHaveDependenciesWarning"
                                    defaultMessage="The file {name} might be used somewhere on the website. If you delete this file, it will disappear from all pages."
                                    values={{ name: name }}
                                />
                            )}
                            {itemType === "folder" && (
                                <FormattedMessage
                                    id="dam.delete.folder.mightHaveDependenciesWarning"
                                    defaultMessage="All files inside the folder {name} will also be removed. These files might be used somewhere on the website. If you delete them, they will disappear from all pages."
                                    values={{ name: name }}
                                />
                            )}
                            {itemType === "selected_items" && (
                                <FormattedMessage
                                    id="dam.delete.selectedItems.mightHaveDependenciesWarning"
                                    defaultMessage="All selected files and folders (including their content) will be removed. Some of the files might be used on the website. If you delete them, they will disappear from all pages."
                                />
                            )}
                        </sc.WarningText>
                    </sc.WarningTextWrapper>
                </sc.WarningWrapper>
                <strong>
                    {itemType === "file" && (
                        <FormattedMessage id="dam.delete.file.areYouSure" defaultMessage="Do you still want to delete this file?" />
                    )}
                    {itemType === "folder" && (
                        <FormattedMessage id="dam.delete.folder.areYouSure" defaultMessage="Do you still want to delete this folder?" />
                    )}
                    {itemType === "selected_items" && (
                        <FormattedMessage id="dam.delete.selectedItems.areYouSure" defaultMessage="Do you still want to delete all selected items?" />
                    )}
                </strong>
            </sc.ConfirmDialogContent>
            <DialogActions>
                <CancelButton onClick={() => onCloseDialog(false)} />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        onCloseDialog(true);
                    }}
                    autoFocus={true}
                    startIcon={<Delete />}
                >
                    <FormattedMessage id="dam.delete.deleteNow" defaultMessage="Delete Now" />
                </Button>
            </DialogActions>
        </Dialog>
    );
};
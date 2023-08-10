import { useApolloClient } from "@apollo/client";
import { CancelButton, messages, SaveButton } from "@comet/admin";
import { useDamAcceptedMimeTypes } from "@comet/cms-admin";
import { AdditionalToolbarItem } from "@comet/cms-admin/lib/dam/DamTable";
import { useFileUpload } from "@comet/cms-admin/lib/dam/DataGrid/fileUpload/useFileUpload";
import { clearDamItemCache } from "@comet/cms-admin/lib/dam/helpers/clearDamItemCache";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { styled } from "@mui/material/styles";
import { getRandomUnsplashImage, UnsplashImage } from "@src/dam/unsplash/getRandomUnsplashImage";
import * as React from "react";
import { FormattedMessage } from "react-intl";

import UnsplashIcon from "./UnsplashIcon";

export const ImportFromUnsplash: AdditionalToolbarItem = () => {
    const client = useApolloClient();
    const { allAcceptedMimeTypes } = useDamAcceptedMimeTypes();
    const [isOpen, setIsOpen] = React.useState(false);
    const [unsplashImage, setUnsplashImage] = React.useState<UnsplashImage>({ file: { acceptedFiles: [], fileRejections: [] } });

    const { uploadFiles } = useFileUpload({
        acceptedMimetypes: allAcceptedMimeTypes,
        onAfterUpload: () => {
            client.reFetchObservableQueries();
            clearDamItemCache(client.cache);
        },
    });

    const handleOpenDialog = async () => {
        const image = await getRandomUnsplashImage();
        setUnsplashImage(image);
        setIsOpen(true);
    };

    const handleCloseDialog = () => {
        setIsOpen(false);
    };

    const handleSave = () => {
        uploadFiles(unsplashImage.file, undefined, "unsplash", unsplashImage.url);
        handleCloseDialog();
    };

    const handleShuffle = async () => {
        const image = await getRandomUnsplashImage();
        setUnsplashImage(image);
    };

    return (
        <>
            <Button variant="text" color="inherit" startIcon={<UnsplashIcon />} onClick={handleOpenDialog}>
                <FormattedMessage id="comet.pages.dam.importFromUnsplash" defaultMessage="Import from Unsplash" />
            </Button>
            <Dialog open={isOpen} onClose={handleCloseDialog}>
                <div>
                    <DialogTitle>Import from unsplash</DialogTitle>
                    <DialogContent>
                        <StyledUnsplashImage src={unsplashImage.url} alt="image" />
                    </DialogContent>
                    <DialogActions>
                        <CancelButton onClick={handleCloseDialog} />
                        <Button onClick={handleShuffle}>
                            <FormattedMessage id="comet.pages.dam.importFromUnsplash.dialog.shuffle" defaultMessage="Shuffle" />
                        </Button>
                        <SaveButton onClick={handleSave}>
                            <FormattedMessage {...messages.save} />
                        </SaveButton>
                    </DialogActions>
                </div>
            </Dialog>
        </>
    );
};

const StyledUnsplashImage = styled("img")`
    max-width: 100%;
`;

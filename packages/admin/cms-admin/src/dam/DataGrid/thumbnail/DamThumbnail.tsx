import { File, Folder, Pdf } from "@comet/admin-icons";
import { Fade, Popper } from "@mui/material";
import { styled } from "@mui/material/styles";
import * as React from "react";

import { GQLDamFile, GQLDamFolder } from "../../../graphql.generated";
import { AudioThumbnail } from "./AudioThumbnail";
import { GQLDamFileThumbnailFragment } from "./DamThumbnail.gql.generated";
import { VideoThumbnail } from "./VideoThumbnail";
export { damFileThumbnailFragment } from "./DamThumbnail.gql";

const ThumbnailWrapper = styled("div")`
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    width: 36px;
    height: 36px;
`;

const ImageThumbnail = styled("img")`
    width: inherit;
    height: inherit;
    border-radius: inherit;
`;

const ImagePreview = styled("img")`
    max-width: 300px;
    max-height: 300px;
    padding: 0.4rem;
    margin-left: 0.25rem;
    background-color: ${({ theme }) => theme.palette.background.paper};
    box-shadow: ${({ theme }) => theme.shadows[1]};
`;

const ColoredFile = styled(File)`
    color: ${({ theme }) => theme.palette.primary.main};
`;

type DamThumbnailFolder = Pick<GQLDamFolder, "__typename">;
type DamThumbnailFile = Pick<GQLDamFile, "__typename" | "mimetype" | "fileUrl"> & { image: GQLDamFileThumbnailFragment | null };

interface DamThumbnailProps {
    asset: DamThumbnailFolder | DamThumbnailFile;
}

export const DamThumbnail = ({ asset }: DamThumbnailProps): React.ReactElement => {
    const [open, setOpen] = React.useState(false);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleMouseOver = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        setOpen(true);
    };
    const handleMouseLeave = () => {
        setAnchorEl(null);
        setOpen(false);
    };

    let thumbnail;
    if (asset.__typename === "DamFile") {
        if (asset.mimetype.startsWith("image/") && asset.image && asset.image.thumbnailUrl) {
            const canBeOpen = open && Boolean(anchorEl);
            const id = canBeOpen ? asset.fileUrl : undefined;
            thumbnail = (
                <>
                    <ImageThumbnail
                        aria-describedby={id}
                        onMouseOver={handleMouseOver}
                        onMouseLeave={handleMouseLeave}
                        src={asset.image.thumbnailUrl}
                    />
                    <Popper id={id} open={open} anchorEl={anchorEl} placement="auto-end" onResize={undefined} onResizeCapture={undefined} transition>
                        {({ TransitionProps }) => (
                            <Fade {...TransitionProps} timeout={350}>
                                <ImagePreview src={asset.fileUrl || undefined} id="preview" />
                            </Fade>
                        )}
                    </Popper>
                </>
            );
        } else if (asset.mimetype.startsWith("audio/")) {
            thumbnail = <AudioThumbnail />;
        } else if (asset.mimetype.startsWith("video/")) {
            thumbnail = <VideoThumbnail />;
        } else if (asset.mimetype === "application/pdf") {
            thumbnail = <Pdf htmlColor="#ce1f19" />;
        } else {
            thumbnail = <ColoredFile />;
        }
    } else {
        thumbnail = <Folder />;
    }

    return <ThumbnailWrapper>{thumbnail}</ThumbnailWrapper>;
};

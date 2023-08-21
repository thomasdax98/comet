import { Box, ComponentsOverrides, Theme, Tooltip, Typography } from "@mui/material";
import { createStyles, WithStyles, withStyles } from "@mui/styles";
import * as React from "react";

export type MenuGroupSectionClassKey = "root" | "sectionTitleContainer" | "sectionTitle";

const styles = (theme: Theme) =>
    createStyles<MenuGroupSectionClassKey, MenuGroupSectionProps>({
        root: { marginTop: theme.spacing(8) },
        sectionTitle: {
            fontWeight: theme.typography.fontWeightBold,
            fontSize: ({ drawerOpen }) => (drawerOpen ? 14 : 12),
            border: ({ drawerOpen }) => (drawerOpen ? `2px solid ${theme.palette.common.white}` : `2px solid ${theme.palette.grey[100]}`),
            borderRadius: ({ drawerOpen }) => (drawerOpen ? "initial" : 20),
            padding: ({ drawerOpen }) => (drawerOpen ? "0" : "0 7px"),
            lineHeight: "20px",
            color: ({ drawerOpen }) => (drawerOpen ? `${theme.palette.common.black}` : `${theme.palette.grey[300]}`),
        },
        sectionTitleContainer: {
            borderBottom: `1px solid ${theme.palette.grey[50]}`,
            display: "flex",
            justifyContent: ({ drawerOpen }) => (drawerOpen ? "flex-start" : "center"),
            padding: ({ drawerOpen }) => `${theme.spacing(2)} ${drawerOpen ? theme.spacing(4) : 0}`,
        },
    });

export interface MenuGroupSectionProps {
    title: string;
    drawerOpen?: boolean;
}

const GroupSection: React.FC<React.PropsWithChildren<WithStyles<typeof styles> & MenuGroupSectionProps>> = ({
    title,
    drawerOpen,
    children,
    classes,
}) => {
    const initialTitle = title;
    function getInitials(title: string) {
        const words = title.split(/\s+/).filter((word) => word.match(/[A-Za-z]/));
        return words.map((word) => word[0].toUpperCase()).join("");
    }

    if (drawerOpen === false) {
        title = getInitials(title);
    }

    return (
        <Box className={classes.root}>
            <Tooltip
                placement="right"
                disableHoverListener={drawerOpen}
                disableFocusListener={drawerOpen}
                disableTouchListener={drawerOpen}
                title={initialTitle}
            >
                <Box className={classes.sectionTitleContainer}>
                    <Typography className={classes.sectionTitle} variant="h3">
                        {title}
                    </Typography>
                </Box>
            </Tooltip>
            {children}
        </Box>
    );
};

export const MenuGroupSection = withStyles(styles, { name: "CometAdminMenuGroupSection" })(GroupSection);

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        CometAdminMenuGroupSection: MenuGroupSectionClassKey;
    }

    interface Components {
        CometAdminMenuGroupSection?: {
            styleOverrides?: ComponentsOverrides<Theme>["CometAdminMenuGroupSection"];
        };
    }
}

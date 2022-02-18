import { buttonClasses, iconButtonClasses, TableCellClassKey } from "@mui/material";
import { Palette } from "@mui/material/styles";
import { Typography } from "@mui/material/styles/createTypography";
import { OverridesStyleRules } from "@mui/material/styles/overrides";

export const getMuiTableCellOverrides = (palette: Palette, typography: Typography): OverridesStyleRules<TableCellClassKey> => ({
    root: {
        borderBottomColor: palette.grey[100],
        paddingTop: 15,
        paddingBottom: 15,
        paddingLeft: 20,
        paddingRight: 20,

        [`& > .${buttonClasses.root}, & > ${iconButtonClasses.root}`]: {
            marginTop: -12,
            marginBottom: -10,
        },
    },
    head: {
        position: "relative",
        borderTop: `1px solid ${palette.grey[100]}`,
        fontSize: 14,
        lineHeight: "20px",
        fontWeight: typography.fontWeightMedium,

        "&:not(:first-child):not(:empty):before": {
            content: "''",
            position: "absolute",
            top: 15,
            left: 8,
            bottom: 15,
            backgroundColor: palette.grey[100],
            width: 2,
        },
    },

    body: {
        fontSize: 16,
        lineHeight: "20px",
    },
    footer: {},
    sizeSmall: {},
    sizeMedium: {},
    paddingCheckbox: {},
    paddingNone: {},
    alignLeft: {},
    alignCenter: {},
    alignRight: {},
    alignJustify: {},
    stickyHeader: {},
});

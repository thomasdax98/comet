import { WithStyles } from "@mui/styles";
import * as React from "react";
import tinycolor from "tinycolor2";

import { styles } from "./ColorPicker.styles";

interface PickedColorProps {
    value: string;
}

const PickedColor: React.FC<Pick<WithStyles<typeof styles>, "classes"> & PickedColorProps> = ({ value, classes }) => (
    <div className={classes.pickedColorWrapper}>
        {!value && <div className={classes.noColorStroke} />}
        <div className={classes.pickedColorIndicator} style={{ background: value ? tinycolor(value).toHexString() : undefined }} />
    </div>
);

export default PickedColor;
import React from "react";
import { FormattedMessage } from "react-intl";

import { formatStrong } from "./formatStrong";

export const NetworkErrorMessage = () => (
    <FormattedMessage
        id="comet.generic.errors.networkError"
        defaultMessage="<strong>Could not connect to server.</strong> Please check your internet connection."
        values={{
            strong: formatStrong,
        }}
    />
);

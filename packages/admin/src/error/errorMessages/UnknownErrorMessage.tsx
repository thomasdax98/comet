import React from "react";
import { FormattedMessage } from "react-intl";

import { formatStrong } from "./formatStrong";

export const UnknownErrorMessage = () => (
    <FormattedMessage
        id="comet.generic.errors.unknownError"
        defaultMessage="<strong>Something went wrong.</strong> Please try again later."
        values={{
            strong: formatStrong,
        }}
    />
);

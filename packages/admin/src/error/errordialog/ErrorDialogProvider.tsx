import { ApolloError } from "@apollo/client";
import * as React from "react";

import { NetworkErrorMessage } from "../errorMessages/NetworkErrorMessage";
import { UnknownErrorMessage } from "../errorMessages/UnknownErrorMessage";
import { ErrorDialog, ErrorDialogOptions } from "./ErrorDialog";
import { ErrorDialogContext, ErrorDialogContextProps } from "./ErrorDialogContext";

interface HandleApolloErrorConfig {
    title?: React.ReactNode;
    defaultMessage?: React.ReactNode;
    overrideNetworkErrorMessage?: React.ReactNode;
    specialMessages?: {
        [key: string]: React.ReactNode;
    };
}

export const ErrorDialogProvider: React.FunctionComponent = ({ children }) => {
    const [errorOptions, setErrorOptions] = React.useState<ErrorDialogOptions | undefined>(undefined);
    const [errorDialogVisible, setErrorDialogVisible] = React.useState(false);

    const showError = React.useCallback((options: ErrorDialogOptions) => {
        setErrorOptions(options);
        setErrorDialogVisible(true);
    }, []);

    const handleApolloError = React.useCallback((apolloError: ApolloError, config?: HandleApolloErrorConfig) => {
        if (apolloError.networkError !== null) {
            showError({
                error: apolloError.message,
                userMessage: config?.overrideNetworkErrorMessage ?? <NetworkErrorMessage />,
                title: config?.title,
            });
        } else if (apolloError.graphQLErrors.length > 0) {
        } else {
            showError({
                error: apolloError.message,
                userMessage: config?.defaultMessage ?? <UnknownErrorMessage />,
                title: config?.title,
            });
        }
    }, []);

    const errorDialog = React.useMemo((): ErrorDialogContextProps => {
        return {
            showError,
        };
    }, [showError]);

    return (
        <ErrorDialogContext.Provider value={errorDialog}>
            {children}
            <ErrorDialog
                show={errorDialogVisible}
                errorOptions={errorOptions}
                onCloseClicked={() => {
                    setErrorDialogVisible(false);

                    setTimeout(() => {
                        setErrorOptions(undefined); // delay cleaning error so Dialog Content does not go away while fadeout transition
                    }, 200);
                }}
            />
        </ErrorDialogContext.Provider>
    );
};

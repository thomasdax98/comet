import * as React from "react";
import { RouteProps } from "react-router";

import { RouterRoute } from "../../router/Route";
import { ErrorBoundary } from "./ErrorBoundary";

const RouteWithErrorBoundary: React.FunctionComponent<RouteProps> = (props) => {
    return (
        <ErrorBoundary key={JSON.stringify(props.path)}>
            <RouterRoute {...props} />
        </ErrorBoundary>
    );
};
export { RouteWithErrorBoundary };

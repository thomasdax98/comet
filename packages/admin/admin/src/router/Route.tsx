import * as React from "react";
import { Route as ReactRouterRoute, RouteProps as ReactRouterRouteProps } from "react-router";
import useConstant from "use-constant";
import { v4 as uuid } from "uuid";

import { PromptContext } from "./Prompt";

export const RouterRoute: React.FunctionComponent<ReactRouterRouteProps> = (props) => {
    const id = useConstant<string>(() => uuid());
    const promptContext = React.useContext(PromptContext);
    React.useEffect(() => {
        promptContext?.registerRoute({
            id,
            path: props.path,
            exact: props.exact,
            sensitive: props.sensitive,
            strict: props.strict,
        });
        return () => {
            promptContext?.unregisterRoute(id);
        };
    });
    return <ReactRouterRoute {...props} />;
};

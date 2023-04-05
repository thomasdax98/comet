import * as History from "history";
import * as React from "react";
import { __RouterContext } from "react-router";
import useConstant from "use-constant";
import { v4 as uuid } from "uuid";

import { RouterContext } from "./Context";
import { SaveAction } from "./PromptHandler";

export interface PromptContextRoute {
    id: string;
    path?: string | readonly string[] | undefined;
    exact?: boolean | undefined;
    sensitive?: boolean | undefined;
    strict?: boolean | undefined;
}
interface PromptContext {
    registerRoute: (options: PromptContextRoute) => void;
    unregisterRoute: (id: string) => void;
}

export const PromptContext = React.createContext<PromptContext | undefined>(undefined);

// react-router Prompt doesn't support multiple Prompts, this one does
interface IProps {
    /**
     * Will be called with the next location and action the user is attempting to navigate to.
     * Return a string to show a prompt to the user or true to allow the transition.
     */
    message: (location: History.Location, action: History.Action) => boolean | string;
    saveAction?: SaveAction;
}
export const RouterPrompt: React.FunctionComponent<IProps> = ({ children, message, saveAction }) => {
    const id = useConstant<string>(() => uuid());
    const reactRouterContext = React.useContext(__RouterContext); // reactRouterContext can be undefined if no router is used, don't fail in that case
    const path: string | undefined = reactRouterContext?.match.path;
    const routerContext = React.useContext(RouterContext);
    const subRoutes = React.useRef<PromptContextRoute[]>([]);
    React.useEffect(() => {
        if (routerContext) {
            routerContext.register({ id, message, saveAction, path, subRoutes: subRoutes.current });
        } else {
            console.error("Can't register RouterPrompt, missing <RouterPromptHandler>");
        }
        return function cleanup() {
            if (routerContext) {
                routerContext.unregister(id);
            }
        };
    });

    return (
        <PromptContext.Provider
            value={{
                registerRoute: (route) => {
                    subRoutes.current = [...subRoutes.current.filter((r) => r.id != route.id), route];
                },
                unregisterRoute: (id) => {
                    subRoutes.current = subRoutes.current.filter((r) => r.id != id);
                },
            }}
        >
            <div style={{ border: "1px solid red" }}>
                {JSON.stringify(subRoutes.current)}
                {children}
            </div>
        </PromptContext.Provider>
    );
};

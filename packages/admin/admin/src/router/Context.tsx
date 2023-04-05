import * as History from "history";
import * as React from "react";

import { PromptContextRoute } from "./Prompt";
import { SaveAction } from "./PromptHandler";

interface IContext {
    register: (options: {
        id: string;
        path?: string;
        message: (location: History.Location, action: History.Action) => string | boolean;
        saveAction?: SaveAction;
        subRoutes?: PromptContextRoute[];
    }) => void;
    unregister: (id: string) => void;
}

export const RouterContext = React.createContext<IContext | undefined>(undefined);

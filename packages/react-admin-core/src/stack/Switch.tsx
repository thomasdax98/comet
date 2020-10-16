import * as React from "react";
import { Route, RouteComponentProps, useHistory, useRouteMatch } from "react-router";
import { StackBreadcrumb } from "./Breadcrumb";
import { IStackPageProps } from "./Page";
import { StackSwitchMeta } from "./SwitchMeta";
const UUID = require("uuid");

interface IProps {
    initialPage?: string;
    title?: string;
    children: Array<React.ReactElement<IStackPageProps>>;
}

export const StackSwitchApiContext = React.createContext<IStackSwitchApi>({
    activatePage: (pageName: string, payload: string, subUrl?: string) => {
        return;
    },
    updatePageBreadcrumbTitle: (title?: string) => {
        return;
    },
});
export interface IStackSwitchApi {
    activatePage: (pageName: string, payload: string, subUrl?: string) => void;
    updatePageBreadcrumbTitle: (title?: string) => void;
    id?: string;
}
interface IRouteParams {
    id?: string;
}


function useUuid() {
    const ref = React.useRef<string | undefined>(undefined);
    if (ref.current === undefined) {
        ref.current = UUID.v4() as string;
    }
    return ref.current;
} 

export function StackSwitch(props: IProps) {
    const [pageBreadcrumbTitle, setPageBreadcrumbTitle] = React.useState<Record<string, string | undefined>>({});
    const history = useHistory();
    const match = useRouteMatch<IRouteParams>();
    const id = useUuid();
    let activePage: string | undefined;

    function activatePage(pageName: string, payload: string, subUrl?: string) {
        if (isInitialPage(pageName)) {
            history.push(match.url);
            if (payload) throw new Error("activating the initialPage must not have a payload");
            if (subUrl) throw new Error("activating the initialPage must not have a subUrl");
        } else {
            history.push(match.url + "/" + payload + "/" + pageName + (subUrl ? "/" + subUrl : ""));
        }
    }

    function getInitialPage() {
        let initialPage = props.initialPage;
        if (!initialPage) {
            initialPage = props.children[0].props.name;
        }
        return initialPage;
    }
    function isInitialPage(pageName?: string) {
        if (!pageName) return true;
        return getInitialPage() === pageName;
    }

    function updatePageBreadcrumbTitle(t?: string) {
        if (activePage) {
            const title = { ...pageBreadcrumbTitle };
            title[activePage] = t;
            setPageBreadcrumbTitle(title);
        }
    }

    if (!match) return null;

    return React.Children.map(props.children, (page: any) => {
        const path = isInitialPage(page.props.name) ? `${match.url}` : `${match.url}/:id/${page.props.name}`;
        return (
            <Route path={path} exact={isInitialPage(page.props.name)}>
                {(routeProps: RouteComponentProps<IRouteParams>) => {
                    if (!routeProps.match) return null;
                    activePage = page.props.name;
                    const ret = (
                        <StackSwitchMeta
                            id={id}
                            activePage={page.props.name}
                            isInitialPageActive={isInitialPage(page.props.name)}
                        >
                            <StackSwitchApiContext.Provider
                                value={{
                                    activatePage,
                                    id,
                                    updatePageBreadcrumbTitle,
                                }}
                            >
                                {typeof page.props.children === "function"
                                    ? page.props.children(routeProps.match.params.id)
                                    : page.props.children}
                            </StackSwitchApiContext.Provider>
                        </StackSwitchMeta>
                    );
                    if (isInitialPage(page.props.name)) {
                        return ret;
                    } else {
                        return (
                            <StackBreadcrumb
                                url={routeProps.match.url}
                                title={pageBreadcrumbTitle[page.props.name] || page.props.title || page.props.name}
                            >
                                {ret}
                            </StackBreadcrumb>
                        );
                    }
                }}
            </Route>
        );
    });
}

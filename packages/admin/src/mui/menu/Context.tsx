import * as React from "react";

export interface IMenuContext {
    open: boolean;
    toggleOpen: () => void;
    headerHeight: number;
}

export interface IWithMenu {
    menu: IMenuContext;
}

export const MenuContext = React.createContext<IMenuContext>({
    open: false,
    toggleOpen: () => {
        // nothing
    },
    headerHeight: 0,
});

export const withMenu = <P extends object>(WrappedComponent: React.ComponentType<P & IWithMenu>): React.FunctionComponent<P> => {
    return (props: P) => {
        return <MenuContext.Consumer>{(value) => <WrappedComponent {...props} menu={value!} />}</MenuContext.Consumer>;
    };
};
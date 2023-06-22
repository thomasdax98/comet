import * as React from "react";
import styled from "styled-components";
import { useDebouncedCallback } from "use-debounce";

import { AdminMessage, AdminMessageType, IFrameMessage, IFrameMessageType } from "./IFrameMessage";
import { PreviewOverlay } from "./PreviewOverlay";

export interface IFrameBridgeContext {
    hasBridge: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    block?: any;
    selectedAdminRoute?: string;
    hoveredAdminRoute?: string;
    sendSelectComponent: (id: string) => void;
    sendHoverComponent: (route: string | null) => void;
    /**
     * @deprecated Use sendSitePreviewIFrameMessage instead
     */
    sendMessage: (message: IFrameMessage) => void;
    showOutlines: boolean;
}

export const IFrameBridgeContext = React.createContext<IFrameBridgeContext>({
    hasBridge: false,
    showOutlines: false,
    sendSelectComponent: () => {
        // empty
    },
    sendHoverComponent: () => {
        // empty
    },
    sendMessage: () => {
        //empty
    },
});

export const IFrameBridgeProvider: React.FunctionComponent = ({ children }) => {
    const [block, setBlock] = React.useState<unknown | undefined>(undefined);
    const [selectedAdminRoute, setSelectedAdminRoute] = React.useState<string | undefined>(undefined);
    const [hoveredAdminRoute, setHoveredAdminRoute] = React.useState<string | undefined>(undefined);
    const [showOutlines, setShowOutlines] = React.useState<boolean>(false);
    const [elementsData, setElementsData] = React.useState<OverlayElementData[]>([]);

    const sendMessage = (message: IFrameMessage) => {
        window.parent.postMessage(JSON.stringify(message), "*");
    };

    const debounceDeactivateOutlines = useDebouncedCallback(() => {
        setShowOutlines(false);
    }, 2500);

    const onReceiveMessage = React.useCallback(
        (message: AdminMessage) => {
            switch (message.cometType) {
                case AdminMessageType.Block:
                    setBlock(message.data.block);
                    break;
                case AdminMessageType.SelectComponent:
                    setSelectedAdminRoute(
                        message.data.adminRoute.lastIndexOf("#") > 0
                            ? message.data.adminRoute.substr(0, message.data.adminRoute.lastIndexOf("#"))
                            : message.data.adminRoute,
                    );
                    break;
                case AdminMessageType.HoverComponent:
                    setHoveredAdminRoute(message.data.adminRoute);
                    setShowOutlines(true);
                    debounceDeactivateOutlines();
                    break;
            }
        },
        [debounceDeactivateOutlines],
    );

    React.useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const handleMessage = (e: MessageEvent) => {
            try {
                const message = JSON.parse(e.data);
                // Check if message is an iframe message from us -> there are more messaging from e.g webpack,etc.
                // eslint-disable-next-line no-prototype-builtins
                if (message.hasOwnProperty("cometType")) {
                    onReceiveMessage(message as AdminMessage);
                }
            } catch (e) {
                // empty
            }
        };

        window.addEventListener("message", handleMessage, false);

        sendMessage({ cometType: IFrameMessageType.Ready });

        return () => {
            window.removeEventListener("message", handleMessage, false);
        };
    }, [onReceiveMessage]);

    return (
        <IFrameBridgeContext.Provider
            value={{
                showOutlines,
                hasBridge: true,
                block,
                selectedAdminRoute,
                hoveredAdminRoute,
                sendSelectComponent: (adminRoute: string) => {
                    setSelectedAdminRoute(adminRoute);
                    sendMessage({ cometType: IFrameMessageType.SelectComponent, data: { adminRoute } });
                },
                sendHoverComponent: (route: string | null) => {
                    sendMessage({ cometType: IFrameMessageType.HoverComponent, data: { route } });
                },
                sendMessage,
            }}
        >
            <OverlayElementsContext.Provider
                value={{
                    elements: elementsData,
                    setElements: setElementsData,
                    updateElement: (id: string, data: Partial<OverlayElementData>) => {
                        setElementsData((elements) =>
                            elements.map((element) => {
                                if (element.id === id) {
                                    return {
                                        ...element,
                                        ...data,
                                    };
                                }
                                return element;
                            }),
                        );
                    },
                }}
            >
                <div
                    onMouseMove={() => {
                        setShowOutlines(true);
                        debounceDeactivateOutlines();
                    }}
                >
                    <PreviewOverlay />
                    <ChildrenWrapper>{children}</ChildrenWrapper>
                </div>
            </OverlayElementsContext.Provider>
        </IFrameBridgeContext.Provider>
    );
};

const ChildrenWrapper = styled.div`
    position: relative;
    z-index: 1;
`;

// TODO: Remove unused-/debugging-data
export type OverlayElementData = {
    id: string;
    name: string;
    adminRoute: string;
    position: {
        zIndex: number;
        top: number;
        left: number;
        width: number;
        height: number;
    };
    onClick: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    children: OverlayElementData[];
};

// TODO: Consider combining this with IFrameBridgeContext
export const OverlayElementsContext = React.createContext<{
    elements: OverlayElementData[];
    setElements: React.Dispatch<React.SetStateAction<OverlayElementData[]>>;
    updateElement: (id: string, data: Partial<OverlayElementData>) => void;
}>({
    elements: [],
    setElements: () => {
        // empty
    },
    updateElement: () => {
        // empty
    },
});

type PreviewNestingContextType = {
    nestingLevel: number;
};

// TODO: Consider combining this with IFrameBridgeContext
export const PreviewNestingContext = React.createContext<PreviewNestingContextType>({
    nestingLevel: 0,
});

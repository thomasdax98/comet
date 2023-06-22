import * as React from "react";
import scrollIntoView from "scroll-into-view-if-needed";
import styled from "styled-components";

import { OverlayElementData, OverlayElementsContext, PreviewNestingContext } from "./IFrameBridge";
import { useId } from "./useId";
import { useIFrameBridge } from "./useIFrameBridge";

interface PreviewProps {
    adminRoute: string;
    type: string;
    enabledAutoScrolling?: boolean;
}

const getCombinedPositioningOfElements = (elements: HTMLElement[]) => {
    const topPositions: number[] = [];
    const leftPositions: number[] = [];
    const bottomPositions: number[] = [];
    const rightPositions: number[] = [];

    const addToPositions = (element: HTMLElement) => {
        const { top, left, bottom, right } = element.getBoundingClientRect();
        topPositions.push(top + window.scrollY);
        leftPositions.push(left + window.scrollX);
        bottomPositions.push(bottom - window.scrollY);
        rightPositions.push(right - window.scrollX);
    };

    // TODO: Infinite recursion and ignore elements with `data-preview-id`???
    elements.forEach((element) => {
        if (element.hasAttribute("data-preview-id")) {
            const childNodes = element.childNodes as unknown as HTMLElement[];
            childNodes.forEach((childNode) => {
                addToPositions(childNode);
            });
        } else {
            addToPositions(element);
        }
    });

    const highestTopPosition = Math.min(...topPositions);
    const highestLeftPosition = Math.min(...leftPositions);

    const widthValues: number[] = [];
    const heightValues: number[] = [];

    const addToSizeValues = (element: HTMLElement) => {
        const { right, bottom } = element.getBoundingClientRect();
        widthValues.push(right - highestLeftPosition);
        heightValues.push(bottom - highestTopPosition);
    };

    elements.forEach((element) => {
        if (element.hasAttribute("data-preview-id")) {
            const childNodes = element.childNodes as unknown as HTMLElement[];
            childNodes.forEach((childNode) => {
                addToSizeValues(childNode);
            });
        } else {
            addToSizeValues(element);
        }
    });

    return {
        top: highestTopPosition,
        left: highestLeftPosition,
        width: Math.max(...widthValues),
        height: Math.max(...heightValues),
    };
};

export const Preview: React.FunctionComponent<PreviewProps> = ({ adminRoute, type, children, enabledAutoScrolling = true }) => {
    const iFrameBridge = useIFrameBridge();
    const isSelected = adminRoute === iFrameBridge.selectedAdminRoute;
    const isHovered = adminRoute === iFrameBridge.hoveredAdminRoute;
    const previewElementContainerRef = React.useRef<HTMLDivElement | null>(null);
    const { setElements } = React.useContext(OverlayElementsContext);
    const previewId = useId("preview-"); // TODO: Replace with `React.useId()` when updating to React 18.
    const { nestingLevel } = React.useContext(PreviewNestingContext);
    const [renderId, setRenderId] = React.useState(0);

    const getPreviewElementData = (el: HTMLElement): OverlayElementData => {
        const childNodes = el.childNodes as unknown as HTMLElement[];
        const combinedPosition = getCombinedPositioningOfElements(childNodes);

        return {
            id: previewId,
            name: type,
            adminRoute,
            position: {
                top: combinedPosition.top,
                left: combinedPosition.left,
                zIndex: nestingLevel + 1,
                width: combinedPosition.width,
                height: combinedPosition.height,
            },
            onClick: () => {
                iFrameBridge.sendSelectComponent(adminRoute);
            },
            onMouseEnter: () => {
                iFrameBridge.sendHoverComponent(adminRoute);
            },
            onMouseLeave: () => {
                iFrameBridge.sendHoverComponent(null);
            },
            children: [],
        };
    };

    // scroll block into view when it gets selected
    // TODO: Fix this
    React.useEffect(() => {
        const timeout = setTimeout(() => {
            if (enabledAutoScrolling) {
                if (isHovered || isSelected) {
                    if (previewElementContainerRef.current) {
                        scrollIntoView(previewElementContainerRef.current, {
                            scrollMode: "if-needed",
                            block: "center",
                            inline: "nearest",
                            behavior: "smooth",
                        });
                    }
                }
            }
        }, 500);
        return () => {
            clearTimeout(timeout);
        };
    }, [enabledAutoScrolling, isHovered, isSelected]);

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            if (previewElementContainerRef.current) {
                const newData = getPreviewElementData(previewElementContainerRef.current);
                setElements((elements) => [...elements, newData]);
            }
        }, 500);
        return () => {
            clearTimeout(timeout);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [adminRoute, type, renderId]);

    React.useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            setRenderId((id) => id + 1);
            setElements([]);
        });

        const previewElementContainer = previewElementContainerRef.current?.childNodes[0] as HTMLElement; // TODO: does this need to use the first child?

        if (previewElementContainer) {
            resizeObserver.observe(previewElementContainer);
        }

        return () => {
            if (previewElementContainer) {
                resizeObserver.unobserve(previewElementContainer);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return iFrameBridge.hasBridge ? (
        <PreviewNestingContext.Provider
            value={{
                nestingLevel: nestingLevel + 1,
            }}
        >
            {/* TODO: Remove data-attributes used for debugging */}
            <PreviewElementContainer ref={previewElementContainerRef} data-preview-id={previewId} data-preview-type={type}>
                {children}
            </PreviewElementContainer>
        </PreviewNestingContext.Provider>
    ) : (
        <>{children}</>
    );
};

export const PreviewElementContainer = styled.div`
    display: contents;
`;

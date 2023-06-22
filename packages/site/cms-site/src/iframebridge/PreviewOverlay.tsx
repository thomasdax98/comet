import * as React from "react";
import styled from "styled-components";
import { css } from "styled-components";

import { OverlayElementsContext } from "./IFrameBridge";
import { useIFrameBridge } from "./useIFrameBridge";

export const PreviewOverlay = () => {
    const { elements } = React.useContext(OverlayElementsContext);
    const iFrameBridge = useIFrameBridge();

    let bottomMostElementPosition = 0;

    elements.forEach((element) => {
        if (element.position.zIndex > 1) return;

        const elementBottom = element.position.top + element.position.height;
        if (elementBottom > bottomMostElementPosition) {
            bottomMostElementPosition = elementBottom;
        }
    });

    return (
        <OverlayRoot style={{ height: bottomMostElementPosition }}>
            {elements.map((element, index) => {
                const isSelected = element.adminRoute === iFrameBridge.selectedAdminRoute;
                const isHovered = element.adminRoute === iFrameBridge.hoveredAdminRoute;

                return (
                    <Element
                        // TODO: Remove data-attributes used for debugging
                        data-preview-element-id={element.id}
                        data-preview-element-name={element.name}
                        key={index}
                        data-element={JSON.stringify(element)}
                        showBlockOutlines={iFrameBridge.showOutlines}
                        blockIsSelected={isSelected}
                        isHoveredInBlockList={isHovered}
                        onClick={element.onClick}
                        onMouseEnter={element.onMouseEnter}
                        onMouseLeave={element.onMouseLeave}
                        style={element.position}
                    >
                        {/* TODO: Remove debug data */}
                        <ElementDebugData>
                            {JSON.stringify(
                                {
                                    id: element.id,
                                    name: element.name,
                                    adminRoute: element.adminRoute,
                                    position: element.position,
                                },
                                null,
                                2,
                            )}
                        </ElementDebugData>
                        <ElementName>{element.name}</ElementName>
                    </Element>
                );
            })}
        </OverlayRoot>
    );
};
const OverlayRoot = styled.div`
    position: absolute;
    z-index: 2;
    top: 0;
    left: 0;
    right: 0;
    min-height: 100vh;
`;

type ElementProps = {
    showBlockOutlines: boolean;
    blockIsSelected: boolean;
    isHoveredInBlockList: boolean;
};

const elementHoverStyles = css`
    outline-color: #29b6f6;
    outline-style: solid;

    :after {
        background-color: #29b6f6;
    }
`;

const Element = styled.div<ElementProps>`
    position: absolute;
    cursor: pointer;
    outline: 1px solid transparent;
    outline-offset: -1px;

    :after {
        content: "";
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        opacity: 0.25;
    }

    :hover {
        ${elementHoverStyles}
    }

    ${({ isHoveredInBlockList: isHovered }) => isHovered && elementHoverStyles}

    ${({ showBlockOutlines: showOutlines, isHoveredInBlockList: isHovered }) =>
        Boolean(showOutlines && !isHovered) &&
        css`
            :not(:hover) {
                outline-color: #d9d9d9;
                outline-style: dashed;
            }
        `}

${({ blockIsSelected: isSelected }) =>
        isSelected &&
        css`
            outline-color: #29b6f6;

            ${ElementName} {
                display: inline-block;
            }

            ${ElementDebugData} {
                display: block;
            }
        `}
`;

const ElementName = styled.div`
    position: absolute;
    padding: 2px 2px 2px 2px;
    background-color: #57b0eb;
    line-height: 16px;
    color: white;
    right: 0;
    font-size: 12px;
    display: none;
`;

// TODO: delete this
const ElementDebugData = styled.pre`
    position: absolute;
    z-index: 1;
    top: 5px;
    left: 5px;
    max-width: calc(100% - 10px);
    max-height: calc(100% - 10px);
    padding: 5px;
    box-sizing: border-box;
    margin: 0;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
    color: #ffffff;
    font-size: 9px;
    font-family: monospace;
    overflow: auto;
    display: none;
`;

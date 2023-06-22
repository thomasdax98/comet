import { PixelImageBlock, PropsWithData, withPreview } from "@comet/cms-site";
import { DebugBlockData } from "@src/blocks.generated";
import * as React from "react";
import styled from "styled-components";

import RichTextBlock from "./RichTextBlock";

const DebugBlock = ({ data }: PropsWithData<DebugBlockData>) => {
    const aspectRatio = "16x9";

    return (
        <Root data-debug="debug-block">
            <ImageWrapper>
                <PixelImageBlock data={data.image} objectFit="cover" layout="fill" aspectRatio={aspectRatio} priority />
            </ImageWrapper>
            <Content>
                <RichTextBlock data={data.text} />
            </Content>
        </Root>
    );
};

export default withPreview(DebugBlock, { label: "Debug" });

const Root = styled.div`
    position: relative;
    cursor: grab;
    height: 100%;
    overflow: hidden;

    :active {
        cursor: grabbing;
    }
`;

const ImageWrapper = styled.div`
    position: relative;
    overflow: hidden;
    height: 0;
    background-color: lime;
    padding-bottom: 56%;
`;

const Content = styled.div`
    padding: 20px;
`;

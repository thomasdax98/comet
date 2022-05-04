/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";

import { BlockPreview } from "../../common/blockRow/BlockPreview";
import { BlockContext, BlockInterface, BlockMethods, DispatchSetStateAction, PreviewContent, SetStateAction } from "../../types";
import { resolveNewState } from "../../utils";
import { isBlockInterface } from "../isBlockInterface";
import {
    AdminComponentPropsMap,
    AdminComponentsMap,
    ChildBlockCountMap,
    CompositeBlocksConfig,
    DataMapInputApi,
    DataMapOutputApi,
    DataMapState,
    IsValidMap,
    PreviewMap,
    StateMap,
} from "./types";
import { applyToCompositeBlocks, applyToCompositeBlocksAsync, createPackData, createPickFlattedData } from "./utils";

// Type of the block generated by compose-blocks
// Note that the broduced block is incomplete, only the BlockMethods are poduced by composeBlocks
export type CompositeBlockInterface<C extends CompositeBlocksConfig> = BlockInterface<DataMapInputApi<C>, DataMapState<C>, DataMapOutputApi<C>>;

// Helper to infer the State
// @TODO: remove ComposedBlockState when it is proven that not needed
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ComposedBlockState<Api> = Api extends ComposeBlocksApi<infer C> ? DataMapState<C> : never;

// Product of composeBlocks
export type ComposeBlocksApi<C extends CompositeBlocksConfig> = {
    block: BlockMethods<DataMapInputApi<C>, DataMapState<C>, DataMapOutputApi<C>>;

    api: {
        adminComponentProps: (props: { state: DataMapState<C>; updateState: DispatchSetStateAction<DataMapState<C>> }) => AdminComponentPropsMap<C>;
        adminComponents: (props: { state: DataMapState<C>; updateState: DispatchSetStateAction<DataMapState<C>> }) => AdminComponentsMap<C>;
        previews: (state: DataMapState<C>, ctx?: BlockContext) => PreviewMap<C>;
        childBlockCounts: (state: DataMapState<C>) => ChildBlockCountMap<C>;
        isValids: (state: DataMapState<C>) => IsValidMap<C>;
    };
};

// Provides an API to create values, functions and react-components
// that are typically needed in composed blocks.
export function composeBlocks<C extends CompositeBlocksConfig>(compositeBlocks: C): ComposeBlocksApi<C> {
    // helper:
    const extractData = createPackData<C>();
    const pickFlattedData = createPickFlattedData<C>();

    // bind the admin-component-props for each block
    const adminComponentProps: ComposeBlocksApi<C>["api"]["adminComponentProps"] = ({ state, updateState }) =>
        applyToCompositeBlocks(compositeBlocks, ([block, options], attr) => {
            if (options.flatten) {
                // handling flattened blocks
                const defaultValueKeys = Object.keys(block.defaultValues() || {}) as Array<keyof typeof state>;
                return {
                    state: pickFlattedData(defaultValueKeys, state),
                    updateState: (setStateAction: SetStateAction<any>) => {
                        updateState((prevState) => {
                            const totalPrevState = prevState;

                            const blockPrevState = pickFlattedData(defaultValueKeys, prevState);

                            // remove previous block state (state of the flattened data), to cleanly merge the previous total block state and the new flattened data
                            const totalPrevStateWithoutFlattendValues = Object.entries(totalPrevState)
                                .filter(([key]) => !defaultValueKeys.includes(key as keyof typeof state))
                                .reduce<Partial<DataMapState<C>>>((prev, [nextKey, nextValue]) => ({ ...prev, [nextKey]: nextValue }), {});

                            return {
                                ...totalPrevStateWithoutFlattendValues,
                                ...resolveNewState({ prevState: blockPrevState, setStateAction }),
                            };
                        });
                    },
                };
                // handling normal (non flattened) blocks
            } else {
                const totalState = state as StateMap<C>;
                const blockState = totalState[attr];
                return {
                    state: blockState,
                    updateState: (setStateAction: SetStateAction<typeof blockState>) => {
                        updateState((prevState) => {
                            const totalPrevState = prevState as any;
                            return {
                                ...totalPrevState,
                                [attr]: resolveNewState({ prevState: totalPrevState[attr], setStateAction }),
                            };
                        });
                    },
                };
            }
        });

    return {
        block: {
            defaultValues: () => applyToCompositeBlocks(compositeBlocks, ([block]) => block.defaultValues(), { flatten: true }),

            input2State: (input) =>
                applyToCompositeBlocks<C>(
                    compositeBlocks,
                    ([block, options], attr) => {
                        const extractedInputData = extractData([block, options], attr, input);
                        return block.input2State(extractedInputData);
                    },
                    { flatten: true },
                ),
            state2Output: (state) =>
                applyToCompositeBlocks(
                    compositeBlocks,
                    ([block, options], attr) => {
                        const extractedData = extractData([block, options], attr, state);
                        return block.state2Output(extractedData);
                    },
                    { flatten: true },
                ),
            output2State: (output, context) =>
                applyToCompositeBlocksAsync(
                    compositeBlocks,
                    ([block, options], attr) => {
                        const extractedOutputData = extractData([block, options], attr, output);
                        return block.output2State(extractedOutputData, context);
                    },
                    { flatten: true },
                ),

            createPreviewState: (s, previewCtx) =>
                applyToCompositeBlocks(
                    compositeBlocks,
                    ([block, options], attr) => {
                        const extractedState = extractData([block, options], attr, s);
                        return block.createPreviewState(extractedState, previewCtx);
                    },
                    { flatten: true },
                ),

            isValid: async (state) => {
                const isValidPromises: Promise<boolean>[] = Object.values(
                    applyToCompositeBlocks(compositeBlocks, ([block, options], attr) => {
                        const extractedData = extractData([block, options], attr, state);
                        return block.isValid(extractedData);
                    }),
                );

                // Favor Promise.all over applyToCompositeBlocksAsync, because it executes in parallel and not in series
                const isValidResults = await Promise.all(isValidPromises);

                return isValidResults.every((c) => c === true);
            },
            previewContent: (state, ctx) => {
                const previewContents = applyToCompositeBlocks(compositeBlocks, ([block, options], attr) => {
                    const extractedData = extractData([block, options], attr, state);

                    return block.previewContent(extractedData, ctx);
                });
                const result = Object.values<PreviewContent[]>(previewContents).reduce<PreviewContent[]>((prev, next) => [...prev, ...next], []);

                return result;
            },
        },
        api: {
            adminComponentProps,
            adminComponents: (props) =>
                applyToCompositeBlocks(compositeBlocks, ([block], attr) => <block.AdminComponent {...adminComponentProps(props)[attr]} />),
            previews: (state, ctx) => {
                return applyToCompositeBlocks(compositeBlocks, ([block, options], attr) => {
                    if (isBlockInterface(block)) {
                        const extractedData = extractData([block, options], attr, state);
                        return <BlockPreview title={null} content={block.previewContent(extractedData, ctx)} />;
                    } else {
                        return null; // No preview component for AnonymousBlock
                    }
                });
            },
            childBlockCounts: (state) =>
                applyToCompositeBlocks(compositeBlocks, ([block, options], attr) => {
                    if (isBlockInterface(block)) {
                        const extractedData = extractData([block, options], attr, state);
                        return block.childBlockCount?.(extractedData) ?? undefined;
                    } else {
                        return undefined;
                    }
                }),
            // A map of isValid-fns for each block, the partial state is bound to the fn, so it takes no arguments
            isValids: (state) =>
                applyToCompositeBlocks(compositeBlocks, ([block, options], attr) => {
                    const extractedData = extractData([block, options], attr, state);
                    return () => block.isValid?.(extractedData);
                }),
        },
    };
}

import { convertFromRaw, DraftEntityMutability, DraftInlineStyleType, EditorState } from "draft-js";
import { v4 } from "uuid";

import stateToHTML from "./stateToHTML";

describe("stateToHTML", () => {
    it("should insert pseudo-tags for multiple sequential inline styles", () => {
        const rawContent = {
            entityMap: {},
            blocks: [
                {
                    key: v4(),
                    text: "Let's test bold and italic.",
                    type: "unstyled",
                    depth: 0,
                    inlineStyleRanges: [
                        {
                            offset: 11,
                            length: 4,
                            style: "BOLD" as DraftInlineStyleType,
                        },
                        {
                            offset: 20,
                            length: 6,
                            style: "ITALIC" as DraftInlineStyleType,
                        },
                    ],
                    entityRanges: [],
                    data: {},
                },
            ],
        };

        const content = convertFromRaw(rawContent);
        const mockState = { editorState: EditorState.createWithContent(content) };

        expect(stateToHTML(mockState.editorState.getCurrentContent())).toEqual(['Let\'s test <i class="1">bold</i> and <i class="2">italic</i>.']);
    });

    it("should insert pseudo-tags in correct order for nested inline styles", () => {
        const rawContent = {
            entityMap: {},
            blocks: [
                {
                    key: v4(),
                    text: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit.",
                    type: "unstyled",
                    depth: 0,
                    inlineStyleRanges: [
                        {
                            offset: 0,
                            length: 11,
                            style: "BOLD" as DraftInlineStyleType,
                        },
                        {
                            offset: 28,
                            length: 29,
                            style: "BOLD" as DraftInlineStyleType,
                        },
                        {
                            offset: 12,
                            length: 15,
                            style: "ITALIC" as DraftInlineStyleType,
                        },
                        {
                            offset: 28,
                            length: 28,
                            style: "ITALIC" as DraftInlineStyleType,
                        },
                    ],
                    entityRanges: [],
                    data: {},
                },
                {
                    key: "3bflg",
                    text: "Aenean commodo ligula eget dolor.",
                    type: "unstyled",
                    depth: 0,
                    inlineStyleRanges: [],
                    entityRanges: [],
                    data: {},
                },
            ],
        };

        const content = convertFromRaw(rawContent);
        const mockState = { editorState: EditorState.createWithContent(content) };

        expect(stateToHTML(mockState.editorState.getCurrentContent())).toEqual([
            '<i class="1">Lorem ipsum</i> <i class="2">dolor sit amet,</i> <i class="4"><i class="3">consectetuer adipiscing elit</i></i><i class="3">.</i>',
            "Aenean commodo ligula eget dolor.",
        ]);
    });

    // TODO
    it("should insert pseudo-tags in for entity ranges", () => {
        const rawContent = {
            entityMap: {
                "0": {
                    type: "LINK",
                    mutability: "MUTABLE" as DraftEntityMutability,
                    data: {
                        attachedBlocks: [
                            {
                                type: "external",
                                props: { targetUrl: "https://github.com/vivid-planet/comet", openInNewWindow: false },
                            },
                        ],
                        block: {
                            type: "external",
                            props: { targetUrl: "https://github.com/vivid-planet/comet", openInNewWindow: false },
                        },
                        activeType: "external",
                    },
                },
                "1": {
                    type: "LINK",
                    mutability: "MUTABLE" as DraftEntityMutability,
                    data: {
                        attachedBlocks: [
                            {
                                type: "external",
                                props: { targetUrl: "https://www.google.com", openInNewWindow: true },
                            },
                        ],
                        block: {
                            type: "external",
                            props: { targetUrl: "https://www.google.com", openInNewWindow: true },
                        },
                        activeType: "external",
                    },
                },
                "2": {
                    type: "LINK",
                    mutability: "MUTABLE" as DraftEntityMutability,
                    data: {
                        attachedBlocks: [
                            {
                                type: "internal",
                                props: {
                                    targetPage: {
                                        id: "36193842-9c36-49e6-9384-6dd0cd572b23",
                                        name: "Home",
                                        path: "/",
                                        documentType: "Page",
                                    },
                                },
                            },
                        ],
                        block: {
                            type: "internal",
                            props: {
                                targetPage: {
                                    id: "36193842-9c36-49e6-9384-6dd0cd572b23",
                                    name: "Home",
                                    path: "/",
                                    documentType: "Page",
                                },
                            },
                        },
                        activeType: "internal",
                    },
                },
            },
            blocks: [
                {
                    key: "3euo0",
                    text: "Now some links are added, pointing somewhere external and internal.",
                    type: "unstyled",
                    depth: 0,
                    inlineStyleRanges: [],
                    entityRanges: [
                        { offset: 9, length: 5, key: 0 },
                        { offset: 45, length: 8, key: 1 },
                        { offset: 58, length: 8, key: 2 },
                    ],
                    data: {},
                },
            ],
        };

        const content = convertFromRaw(rawContent);
        const mockState = { editorState: EditorState.createWithContent(content) };

        expect(stateToHTML(mockState.editorState.getCurrentContent())).toEqual([
            'Now some <e class="1">links</e> are added, pointing somewhere <e class="2">external</e> and <e class="3">internal</e>.',
        ]);
    });

    it("should insert pseudo-tags in for combined entity ranges and inline styles", () => {
        const rawContent = {
            entityMap: {
                "0": {
                    type: "LINK",
                    mutability: "MUTABLE" as DraftEntityMutability,
                    data: {
                        attachedBlocks: [
                            {
                                type: "external",
                                props: { targetUrl: "https://github.com/vivid-planet/comet", openInNewWindow: false },
                            },
                        ],
                        block: {
                            type: "external",
                            props: { targetUrl: "https://github.com/vivid-planet/comet", openInNewWindow: false },
                        },
                        activeType: "external",
                    },
                },
                "1": {
                    type: "LINK",
                    mutability: "MUTABLE" as DraftEntityMutability,
                    data: {
                        attachedBlocks: [
                            {
                                type: "external",
                                props: { targetUrl: "https://www.google.com", openInNewWindow: true },
                            },
                        ],
                        block: {
                            type: "external",
                            props: { targetUrl: "https://www.google.com", openInNewWindow: true },
                        },
                        activeType: "external",
                    },
                },
                "2": {
                    type: "LINK",
                    mutability: "MUTABLE" as DraftEntityMutability,
                    data: {
                        attachedBlocks: [
                            {
                                type: "internal",
                                props: {
                                    targetPage: {
                                        id: "36193842-9c36-49e6-9384-6dd0cd572b23",
                                        name: "Home",
                                        path: "/",
                                        documentType: "Page",
                                    },
                                },
                            },
                        ],
                        block: {
                            type: "internal",
                            props: {
                                targetPage: {
                                    id: "36193842-9c36-49e6-9384-6dd0cd572b23",
                                    name: "Home",
                                    path: "/",
                                    documentType: "Page",
                                },
                            },
                        },
                        activeType: "internal",
                    },
                },
            },
            blocks: [
                {
                    key: "3bflg",
                    text: "Now some links are added, pointing somewhere external and internal also including some styling tags.",
                    type: "unstyled",
                    depth: 0,
                    inlineStyleRanges: [
                        { offset: 4, length: 20, style: "BOLD" as DraftInlineStyleType },
                        { offset: 35, length: 12, style: "ITALIC" as DraftInlineStyleType },
                    ],
                    entityRanges: [
                        { offset: 9, length: 5, key: 0 },
                        { offset: 45, length: 8, key: 1 },
                        { offset: 58, length: 8, key: 2 },
                    ],
                    data: {},
                },
            ],
        };

        const content = convertFromRaw(rawContent);
        const mockState = { editorState: EditorState.createWithContent(content) };

        expect(stateToHTML(mockState.editorState.getCurrentContent())).toEqual([
            'Now <i class="1">some </i><e class="1"><i class="1">links</i></e><i class="1"> are added</i>, pointing <i class="2">somewhere </i><e class="2"><i class="2">ex</i>ternal</e> and <e class="3">internal</e> also including some styling tags.',
        ]);
    });
});
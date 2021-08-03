import { ApolloLink, InMemoryCache } from "@apollo/client";
import { MockedProvider, MockedResponse, MockLink } from "@apollo/client/testing";
import { createErrorDialogApolloLink, ErrorDialogProvider, useErrorDialog } from "@comet/admin";
import { StoryContext, StoryFn } from "@storybook/addons";
import * as React from "react";

interface CustomApolloProviderProps {
    mocks: MockedResponse[];
}

const CustomApolloProvider: React.FunctionComponent<CustomApolloProviderProps> = ({ children, mocks }) => {
    const errorDialog = useErrorDialog();

    const link = ApolloLink.from([createErrorDialogApolloLink({ errorDialog }), new MockLink(mocks)]);

    const cache = new InMemoryCache();

    return (
        <MockedProvider link={link} cache={cache}>
            {children}
        </MockedProvider>
    );
};

export function mockedApolloStoryDecorator<StoryFnReturnType = unknown>(options: { mocks: MockedResponse[] }) {
    return (fn: StoryFn<StoryFnReturnType>, c: StoryContext) => {
        return (
            <ErrorDialogProvider>
                <CustomApolloProvider mocks={options.mocks}>{fn()}</CustomApolloProvider>
            </ErrorDialogProvider>
        );
    };
}

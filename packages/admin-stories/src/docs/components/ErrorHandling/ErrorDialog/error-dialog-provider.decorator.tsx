import { ErrorDialogProvider } from "@comet/admin";
import type { StoryContext, StoryFn } from "@storybook/addons";
import * as React from "react";

export function errorDialogStoryProviderDecorator<StoryFnReturnType = unknown>() {
    return (fn: StoryFn<StoryFnReturnType>, c: StoryContext) => {
        return <ErrorDialogProvider>{fn()}</ErrorDialogProvider>;
    };
}
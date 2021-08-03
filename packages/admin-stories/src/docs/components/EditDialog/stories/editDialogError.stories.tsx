import { ApolloError, useMutation } from "@apollo/client";
import { FinalForm, LocalErrorScopeApolloContext, useEditDialog } from "@comet/admin";
import { Button } from "@material-ui/core";
import { storiesOf } from "@storybook/react";
import { GraphQLError } from "graphql";
import React from "react";

import { mockedApolloStoryDecorator } from "../../../../mocked-apollo-story.decorator";
import { storyRouterDecorator } from "../../../../story-router.decorator";
import { errorMutation } from "../editDialog.gql";

storiesOf("stories/components/Edit Dialog/Edit Dialog with Error", module)
    .addDecorator(storyRouterDecorator())
    .addDecorator(
        mockedApolloStoryDecorator({
            mocks: [
                {
                    request: {
                        query: errorMutation,
                    },
                    result: {
                        errors: [new GraphQLError("Error!")],
                    },
                },
            ],
        }),
    )
    .add("Edit Dialog Error", () => {
        const Story = () => {
            const [errorState, setErrorState] = React.useState<ApolloError>();
            const [EditDialog, selectionApi, editDialogApi] = useEditDialog();
            const [produceError, { error }] = useMutation(errorMutation, { context: LocalErrorScopeApolloContext });

            console.log("error", error);

            React.useEffect(() => {
                if (error) {
                    setErrorState(error);
                }
            }, [error]);

            return (
                <>
                    <Button
                        onClick={() => {
                            editDialogApi.openAddDialog();
                        }}
                    >
                        Open EditDialog
                    </Button>

                    <EditDialog error={errorState}>
                        {selectionApi.mode === "add" && (
                            <FinalForm
                                mode={selectionApi.mode}
                                onSubmit={() => {
                                    return produceError();
                                }}
                            >
                                Press save to produce error
                            </FinalForm>
                        )}
                    </EditDialog>
                </>
            );
        };
        return <Story />;
    });

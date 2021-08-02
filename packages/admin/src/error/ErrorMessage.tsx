import { ApolloError } from "@apollo/client";
import { Error } from "@comet/admin-icons";
import { Accordion, AccordionDetails, AccordionSummary, List, ListItem, Theme } from "@material-ui/core";
import { KeyboardArrowDown } from "@material-ui/icons";
import React from "react";
import { FormattedMessage } from "react-intl";
import styled from "styled-components";

export const ErrorWrapper = styled.div`
    background: ${({ theme }: { theme: Theme }) => theme.palette.common.white};
    border: ${({ theme }: { theme: Theme }) => theme.palette.error.main} solid 1px;
    border-radius: 4px;
    padding: 20px;
    margin: 20px 0;
`;

export const FlexWrapper = styled.div`
    display: flex;
`;

export const ErrorIcon = styled(Error)`
    font-size: 20px;
    color: ${({ theme }: { theme: Theme }) => theme.palette.error.dark};
`;

export const ErrorTextWrapper = styled.div`
    padding-left: 10px;
    width: 100%;
`;

export const ErrorHeading = styled.h3`
    font-size: 16px;
    margin: 0;
`;

export const ErrorText = styled.p`
    margin: 5px 0 0;
`;

interface ErrorMessageProps {
    error?: ApolloError;
    message?: string;
    showApiErrors?: boolean;
}

export const ErrorMessage = ({ error, message, showApiErrors = false }: ErrorMessageProps): React.ReactElement | null => {
    if (error === undefined) {
        return null;
    }

    return (
        <ErrorWrapper>
            <FlexWrapper>
                <ErrorIcon />
                <ErrorTextWrapper>
                    <ErrorHeading>
                        {error.graphQLErrors[0]?.extensions?.exception?.response?.statusCode !== undefined ? (
                            <FormattedMessage
                                id="comet.generic.errorCode"
                                defaultMessage="Error Code {code}"
                                values={{
                                    code: error.graphQLErrors[0].extensions.exception.response.statusCode,
                                }}
                            />
                        ) : (
                            <FormattedMessage id="comet.generic.error" defaultMessage="Error" />
                        )}
                    </ErrorHeading>
                    <ErrorText>
                        {message ?? (
                            <>
                                <FormattedMessage
                                    id="comet.generic.errorOccurred"
                                    defaultMessage="An error has occurred. Please carry out the last action again. If the problem persists, contact an administrator."
                                />

                                {showApiErrors && (
                                    <List>
                                        {error.graphQLErrors.map((error) => (
                                            <ListItem key={error.message}>{error.message}</ListItem>
                                        ))}
                                        {error.networkError && <ListItem>{error.networkError.message}</ListItem>}
                                    </List>
                                )}
                            </>
                        )}
                    </ErrorText>
                </ErrorTextWrapper>
            </FlexWrapper>
            {process.env.NODE_ENV === "development" && (
                <Accordion>
                    <AccordionSummary expandIcon={<KeyboardArrowDown />}>
                        <FormattedMessage id={"comet.errorDialog.Details"} defaultMessage={"Details"} />
                    </AccordionSummary>
                    <AccordionDetails style={{ overflow: "auto", maxWidth: "100%" }}>
                        <pre>{JSON.stringify(error, null, 2)}</pre>
                    </AccordionDetails>
                </Accordion>
            )}
        </ErrorWrapper>
    );
};

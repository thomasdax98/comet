import { gql } from "@apollo/client";

export const errorMutation = gql`
    mutation ErrorMutation {
        errorMutation {
            id
        }
    }
`;

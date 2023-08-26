// This file has been generated by comet admin-generator.
// You may choose to use this file as scaffold by moving this file out of generated folder and removing this comment.

import { gql } from "@apollo/client";

export const orderFormFragment = gql`
    fragment OrderForm on Order {
        totalAmountPaid
        isPaid
        date
    }
`;

export const orderFormQuery = gql`
    query OrderForm($id: ID!) {
        order(id: $id) {
            id
            updatedAt
            ...OrderForm
        }
    }
    ${orderFormFragment}
`;

export const orderFormCheckForChangesQuery = gql`
    query OrderFormCheckForChanges($id: ID!) {
        order(id: $id) {
            updatedAt
        }
    }
`;

export const createOrderMutation = gql`
    mutation CreateOrder($input: OrderInput!) {
        createOrder(input: $input) {
            id
            updatedAt
            ...OrderForm
        }
    }
    ${orderFormFragment}
`;

export const updateOrderMutation = gql`
    mutation UpdateOrder($id: ID!, $input: OrderUpdateInput!, $lastUpdatedAt: DateTime) {
        updateOrder(id: $id, input: $input, lastUpdatedAt: $lastUpdatedAt) {
            id
            updatedAt
            ...OrderForm
        }
    }
    ${orderFormFragment}
`;

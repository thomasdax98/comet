// This file has been generated by comet admin-generator.
// You may choose to use this file as scaffold by moving this file out of generated folder and removing this comment.

import { Stack, StackPage, StackSwitch } from "@comet/admin";
import * as React from "react";
import { useIntl } from "react-intl";

import { OrderForm } from "./OrderForm";
import { OrdersGrid } from "./OrdersGrid";

export function OrdersPage(): React.ReactElement {
    const intl = useIntl();
    return (
        <Stack topLevelTitle={intl.formatMessage({ id: "orders.orders", defaultMessage: "Orders" })}>
            <StackSwitch>
                <StackPage name="grid">
                    <OrdersGrid />
                </StackPage>
                <StackPage name="edit" title={intl.formatMessage({ id: "orders.editOrder", defaultMessage: "Edit Order" })}>
                    {(selectedId) => <OrderForm id={selectedId} />}
                </StackPage>
                <StackPage name="add" title={intl.formatMessage({ id: "orders.addOrder", defaultMessage: "Add Order" })}>
                    <OrderForm />
                </StackPage>
            </StackSwitch>
        </Stack>
    );
}

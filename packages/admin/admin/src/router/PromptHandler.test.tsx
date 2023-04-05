/* eslint-disable @calm/react-intl/missing-formatted-message */
import { createTheme } from "@mui/material/styles";
import { fireEvent, render, waitFor } from "@testing-library/react";
import React from "react";
import { IntlProvider } from "react-intl";
import { Redirect, Switch } from "react-router";
import { Link } from "react-router-dom";

import { MuiThemeProvider } from "../mui/ThemeProvider";
import { RouterMemoryRouter } from "./MemoryRouter";
import { RouterPrompt } from "./Prompt";
import { RouterRoute } from "./Route";

test("Nested route in Prompt", async () => {
    function Story() {
        return (
            <Switch>
                <RouterRoute path="/foo">
                    <RouterPrompt
                        message={() => {
                            return "sure?";
                        }}
                    >
                        <Link to="/foo/sub">subLink</Link>
                        <RouterRoute path="/foo/sub">
                            <div>sub</div>
                        </RouterRoute>
                    </RouterPrompt>
                </RouterRoute>
                <Redirect to="/foo" />
            </Switch>
        );
    }

    const rendered = render(
        <IntlProvider locale="en" messages={{}}>
            <MuiThemeProvider theme={createTheme()}>
                <RouterMemoryRouter>
                    <Story />
                </RouterMemoryRouter>
            </MuiThemeProvider>
        </IntlProvider>,
    );

    fireEvent.click(rendered.getByText("subLink"));

    // verify navigation to sub didn't get blocked
    await waitFor(() => {
        const sub = rendered.queryAllByText("sub");
        expect(sub.length).toBe(1);
    });
});

test("Nested route with non-sub-path route in Prompt", async () => {
    function Story() {
        return (
            <Switch>
                <RouterRoute path="/foo">
                    <RouterPrompt
                        message={() => {
                            return "sure?";
                        }}
                    >
                        <Link to="/foo/sub">subLink</Link>
                        <Link to="/foo">fooLink</Link>
                        <RouterRoute path="/foo">
                            <div>foo</div>
                        </RouterRoute>
                        <RouterRoute path="/foo/sub">
                            <div>sub</div>
                        </RouterRoute>
                    </RouterPrompt>
                </RouterRoute>
                <Redirect to="/foo" />
            </Switch>
        );
    }

    const rendered = render(
        <IntlProvider locale="en" messages={{}}>
            <MuiThemeProvider theme={createTheme()}>
                <RouterMemoryRouter>
                    <Story />
                </RouterMemoryRouter>
            </MuiThemeProvider>
        </IntlProvider>,
    );

    fireEvent.click(rendered.getByText("subLink"));

    // verify navigation to /foo/sub didn't get blocked
    await waitFor(() => {
        const sub = rendered.queryAllByText("sub");
        expect(sub.length).toBe(1);
    });

    fireEvent.click(rendered.getByText("fooLink"));

    // verify navigation back to /foo didn't get blocked
    await waitFor(() => {
        const sub = rendered.queryAllByText("sub");
        expect(sub.length).toBe(0);
    });
});

test("route outside Prompt", async () => {
    function Story() {
        return (
            <Switch>
                <RouterRoute path="/" exact={true}>
                    <RouterPrompt
                        message={() => {
                            return "sure?";
                        }}
                    >
                        <Link to="/bar">barLink</Link>
                    </RouterPrompt>
                </RouterRoute>
                <RouterRoute path="/bar">bar</RouterRoute>
            </Switch>
        );
    }

    const rendered = render(
        <IntlProvider locale="en" messages={{}}>
            <MuiThemeProvider theme={createTheme()}>
                <RouterMemoryRouter>
                    <Story />
                </RouterMemoryRouter>
            </MuiThemeProvider>
        </IntlProvider>,
    );

    fireEvent.click(rendered.getByText("barLink"));

    // verify navigation to bar did get blocked
    await waitFor(() => {
        const sub = rendered.queryAllByText("bar");
        expect(sub.length).toBe(0);
    });

    // and dirty dialog is shown
    await waitFor(() => {
        const sub = rendered.queryAllByText("sure?");
        expect(sub.length).toBe(1);
    });
});

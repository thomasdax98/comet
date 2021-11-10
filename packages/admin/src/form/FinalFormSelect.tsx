import { SelectProps } from "@material-ui/core";
import { MenuItem } from "@material-ui/core";
import * as React from "react";
import { FieldRenderProps } from "react-final-form";

import { Select } from "./Select";

interface FinalFormSelectProps<T> extends FieldRenderProps<T, HTMLInputElement | HTMLTextAreaElement> {
    getOptionLabel?: (option: T) => string;
}

export const FinalFormSelect = <T extends Record<string, any>>({
    input: { checked, value, name, onChange, onFocus, onBlur, ...restInput },
    meta,
    options = null,
    loading = false,
    getOptionLabel = (option: T) => {
        if (typeof option === "object") {
            console.error(`The \`getOptionLabel\` method of FinalFormSelect returned an object instead of a string for${JSON.stringify(option)}.`);
        }
        return "";
    },
    ...rest
}: FinalFormSelectProps<T> & Omit<SelectProps, "input">) => {
    if (options === null) {
        return <Select {...rest} name={name} onChange={onChange} value={value} onFocus={onFocus} onBlur={onBlur} />;
    }

    return (
        <Select {...rest} name={name} onChange={onChange} value={value} onFocus={onFocus} onBlur={onBlur}>
            {options.length === 0 && value /* @ts-ignore - necessary to load object into value */ && (
                <MenuItem value={value} key={JSON.stringify(value)}>
                    {getOptionLabel(value)}
                </MenuItem>
            )}
            {options.map((option: T) /* @ts-ignore - necessary to load object into value */ => (
                <MenuItem value={option} key={JSON.stringify(option)}>
                    {getOptionLabel(option)}
                </MenuItem>
            ))}
        </Select>
    );
};

import isEmpty from "lodash.isempty";
import set from "lodash.set";
import * as queryString from "query-string";
import React from "react";
import { useHistory, useLocation } from "react-router";

type UseUrlStateApi<T extends Record<string, any>> = [T | Record<string, any> | undefined, (value: T, reset?: boolean) => void];

export const useUrlState = <T extends Record<string, any>>(): UseUrlStateApi<T> => {
    const [value, _setValue] = React.useState<T | Record<string, any> | undefined>(undefined);
    const location = useLocation();
    const history = useHistory();

    React.useEffect(() => {
        const queryParsed = queryString.parse(location.search, { arrayFormat: "bracket" });
        const objectParsedFromQuery = {};
        Object.entries(queryParsed).forEach(([key, value]) => {
            set(objectParsedFromQuery, key, value);
        });
        _setValue(objectParsedFromQuery);
    }, [location.search]);

    const setValue = (inputValue: T, reset: boolean | undefined) => {
        if (isEmpty(inputValue)) {
            history.push(`${location.pathname}`);
        } else {
            const newObject: Record<string, any> = reset ? {} : Object.assign({}, value);
            Object.keys(inputValue).forEach((key) => {
                if (inputValue[key] !== null) {
                    newObject[key] = inputValue[key];
                } else {
                    delete newObject[key];
                }
            });

            let url;
            if (!isEmpty(location.search)) {
                let existingValues: Record<string, any> = reset ? {} : queryString.parse(location.search, { arrayFormat: "bracket" });

                if (isEmpty(newObject)) {
                    existingValues = {};
                } else {
                    Object.keys(newObject).forEach((key) => {
                        if (typeof newObject[key] === "object" && !Array.isArray(newObject[key])) {
                            Object.entries(newObject[key]).forEach(([innerKey, value]) => {
                                existingValues[`${key}.${innerKey}`] = value;
                            });
                        } else {
                            existingValues = newObject;
                        }
                    });
                }

                url = `${location.pathname}?${queryString.stringify(existingValues, { encode: false, arrayFormat: "bracket" })}`;
            } else {
                const existingValues: Record<string, any> = {};
                Object.keys(newObject).forEach((key) => {
                    if (typeof newObject[key] === "object" && !Array.isArray(newObject[key])) {
                        Object.entries(newObject[key]).forEach(([innerKey, value]) => {
                            existingValues[`${key}.${innerKey}`] = value;
                        });
                    } else {
                        existingValues[key] = newObject[key];
                    }
                });

                url = `${location.pathname}?${queryString.stringify(existingValues, { encode: false, arrayFormat: "bracket" })}`;
            }
            history.push(url);
        }
    };

    return [value, setValue];
};

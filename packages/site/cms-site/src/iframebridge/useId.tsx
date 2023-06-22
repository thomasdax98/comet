import { useState } from "react";

let id = 1;

export const useId = (prefix = ""): string => {
    const [uniqueId] = useState<string>(() => {
        return `${prefix}${id++}`;
    });
    return uniqueId;
};

import CodeBlock from "@theme/CodeBlock";
import type { Props as PlaygroundProps } from "@theme/Playground";
import React from "react";
import { transform } from "sucrase";

interface LiveCodeBlockProps extends PlaygroundProps {
    path: string;
}

const importStory = async (name: string) => {
    const { default: code } = await import(`!!raw-loader!../stories/${name}`);
    return code;
};

export const LiveCodeBlock = ({ path, ...props }: LiveCodeBlockProps) => {
    const [code, setCode] = React.useState("");

    React.useEffect(() => {
        importStory(path).then(setCode);
    }, [path]);

    return (
        <CodeBlock
            language="tsx"
            live
            transformCode={(code) => {
                const compiledCode = transform(code, { transforms: ["typescript", "jsx"], jsxRuntime: "preserve" }).code;
                const codeWithoutImports = compiledCode.replace(/import.*\n/g, "");
                return codeWithoutImports;
            }}
            {...props}
        >
            {code}
        </CodeBlock>
    );
};

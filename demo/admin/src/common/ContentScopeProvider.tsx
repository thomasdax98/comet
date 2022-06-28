import { Domain as DomainIcon } from "@comet/admin-icons";
import {
    ContentScopeConfigProps,
    ContentScopeControls as ContentScopeControlsLibrary,
    ContentScopeControlsConfig,
    ContentScopeProvider as ContentScopeProviderLibrary,
    ContentScopeProviderProps,
    ContentScopeValues,
    useContentScope as useContentScopeLibrary,
    UseContentScopeApi,
    useContentScopeConfig as useContentScopeConfigLibrary,
    useSitesConfig,
} from "@comet/cms-admin";
import React from "react";

type Domain = "main" | "secondary" | string;
type Language = "en" | string;
export interface ContentScope {
    domain: Domain;
    language: Language;
}

// convenince wrapper for app (Bind Generic)
export function useContentScope(): UseContentScopeApi<ContentScope> {
    return useContentScopeLibrary<ContentScope>();
}

const controlsConfig: ContentScopeControlsConfig<ContentScope> = {
    domain: {
        label: "Domain",
        icon: DomainIcon,
    },
};

// @TODO (maybe): make factory in library to statically create Provider and Controls

// convenince wrapper for app (Bind config and Generic)
export const ContentScopeControls: React.FC = () => {
    return <ContentScopeControlsLibrary<ContentScope> config={controlsConfig} />;
};

export function useContentScopeConfig(p: ContentScopeConfigProps): void {
    return useContentScopeConfigLibrary(p);
}

const ContentScopeProvider: React.FC<Pick<ContentScopeProviderProps, "children">> = ({ children }) => {
    const sitesConfig = useSitesConfig();
    const values: ContentScopeValues<ContentScope> = {
        domain: Object.keys(sitesConfig.configs).map((key) => ({ value: key })),
        language: [{ label: "English", value: "en" }],
    };

    return (
        <ContentScopeProviderLibrary<ContentScope> values={values} defaultValue={{ domain: "main", language: "en" }}>
            {children}
        </ContentScopeProviderLibrary>
    );
};

export default ContentScopeProvider;
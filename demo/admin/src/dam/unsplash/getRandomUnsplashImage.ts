import { Files } from "@comet/cms-admin/lib/dam/DataGrid/fileUpload/useFileUpload";

export interface UnsplashImage {
    file: Files;
    url?: string;
}

async function fetchUnsplashImage(url: string) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Failed to fetch image");
    }

    return {
        blob: await response.blob(),
        origin: response.url,
    };
}

function extractFileNameFromUrl(url: string): string {
    const fileNameWithQuery = url.split("?")[0];
    const fileName = fileNameWithQuery.split("/").pop();
    return fileName ? `${fileName}.jpeg` : "unnamed.jpeg";
}

export async function getRandomUnsplashImage(): Promise<UnsplashImage> {
    const imageUrl = "https://source.unsplash.com/all/";

    try {
        const image = await fetchUnsplashImage(imageUrl);
        const fileName = extractFileNameFromUrl(image.origin);
        const mimeType = image.blob.type || "application/octet-stream";
        const acceptedFile = new File([image.blob], fileName, { type: mimeType });

        return {
            file: { acceptedFiles: [acceptedFile], fileRejections: [] },
            url: image.origin,
        };
    } catch (error) {
        throw new Error(`Failed to fetch image: ${error}`);
    }
}

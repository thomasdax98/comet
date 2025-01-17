import { download, File, FilesService } from "@comet/cms-api";
import faker from "faker";

export class UnsplashImageFileFixture {
    constructor(private filesService: FilesService) {}
    async generateImage(): Promise<File> {
        const width = faker.datatype.number({
            min: 1000,
            max: 3000,
        });
        const height = faker.datatype.number({
            min: 1000,
            max: 3000,
        });

        const imageUrl = `https://source.unsplash.com/random/${width}x${height}`;
        console.log(`Downloading ${imageUrl}.`);
        const downloadedImage = await download(imageUrl);
        console.log(`Downloading ${imageUrl} done.`);
        console.log(`Uploading ${downloadedImage.originalname}.`);
        const file = await this.filesService.upload(downloadedImage);
        console.log(`Uploading ${downloadedImage.originalname} done.`);
        return file;
    }
}

import { BlocksBlockFragment } from "../..";
import { ListBlockFragment } from "./createListBlock";

type Unarray<T> = T extends Array<infer U> ? U : T;

type ExtractAdditionalItemFields<CollectionBlockData extends ListBlockFragment | BlocksBlockFragment> = Omit<
    Unarray<CollectionBlockData["blocks"]>,
    "key" | "visible" | "type" | "props"
>;

export { ExtractAdditionalItemFields };

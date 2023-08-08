import { Type } from "@nestjs/common";
import { plainToInstance, Transform } from "class-transformer";
import { IsOptional, IsString, ValidateNested } from "class-validator";

import { DamScopeInterface } from "../../types";

export interface UploadFileBodyInterface {
    scope: DamScopeInterface;
    folderId?: string;
    sourceId?: string;
    sourceType?: string;
}

export function createUploadFileBody({ Scope }: { Scope: Type<DamScopeInterface> }): Type<UploadFileBodyInterface> {
    class UploadFileBody implements UploadFileBodyInterface {
        @Transform(({ value }) => plainToInstance(Scope, JSON.parse(value)))
        @ValidateNested()
        scope: DamScopeInterface;

        @IsOptional()
        @IsString()
        folderId?: string;

        @IsOptional()
        @IsString()
        sourceId?: string;

        @IsOptional()
        @IsString()
        sourceType?: string;
    }

    return UploadFileBody;
}

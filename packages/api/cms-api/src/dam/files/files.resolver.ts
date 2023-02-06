import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/postgresql";
import { NotFoundException, Type } from "@nestjs/common";
import { Args, ID, Mutation, ObjectType, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { basename, extname } from "path";

import { SkipBuild } from "../../builds/skip-build.decorator";
import { SubjectEntity } from "../../common/decorators/subject-entity.decorator";
import { PaginatedResponseFactory } from "../../common/pagination/paginated-response.factory";
import { ScopeGuardActive } from "../../content-scope/decorators/scope-guard-active.decorator";
import { DamScopeInterface } from "../types";
import { EmptyDamScope } from "./dto/empty-dam-scope";
import { createFileArgs, FileArgsInterface } from "./dto/file.args";
import { UpdateFileInput } from "./dto/file.input";
import { FilenameInput, FilenameResponse } from "./dto/filename.args";
import { FileInterface } from "./entities/file.entity";
import { FilesService } from "./files.service";
import { slugifyFilename } from "./files.utils";

export function createFilesResolver({ File, Scope: PassedScope }: { File: Type<FileInterface>; Scope?: Type<DamScopeInterface> }): Type<unknown> {
    const Scope = PassedScope ?? EmptyDamScope;
    const hasNonEmptyScope = PassedScope != null;

    function nonEmptyScopeOrNothing(scope: DamScopeInterface): DamScopeInterface | undefined {
        // GraphQL sends the scope object with a null prototype ([Object: null prototype] { <key>: <value> }), but MikroORM uses the
        // object's hasOwnProperty method internally, resulting in a "object.hasOwnProperty is not a function" error. To fix this, we
        // create a "real" JavaScript object by using the spread operator.
        // See https://github.com/mikro-orm/mikro-orm/issues/2846 for more information.
        return hasNonEmptyScope ? { ...scope } : undefined;
    }

    const FileArgs = createFileArgs({ Scope });

    @ObjectType()
    class PaginatedDamFiles extends PaginatedResponseFactory.create(File) {}

    @ScopeGuardActive(hasNonEmptyScope)
    @Resolver(() => File)
    class FilesResolver {
        constructor(
            private readonly filesService: FilesService,
            @InjectRepository("File") private readonly filesRepository: EntityRepository<FileInterface>,
        ) {}

        @Query(() => PaginatedDamFiles)
        async damFilesList(@Args({ type: () => FileArgs }) args: FileArgsInterface): Promise<PaginatedDamFiles> {
            const [files, totalCount] = await this.filesService.findAndCount(args, nonEmptyScopeOrNothing(args.scope));
            return new PaginatedDamFiles(files, totalCount);
        }

        @Query(() => File)
        @SubjectEntity(File)
        async damFile(@Args("id", { type: () => ID }) id: string): Promise<FileInterface> {
            const file = await this.filesService.findOneById(id);
            if (!file) {
                throw new NotFoundException(id);
            }
            return file;
        }

        @Mutation(() => File)
        @SubjectEntity(File)
        async updateDamFile(
            @Args("id", { type: () => ID }) id: string,
            @Args("input", { type: () => UpdateFileInput }) input: UpdateFileInput,
        ): Promise<FileInterface> {
            return this.filesService.updateById(id, input);
        }

        @Mutation(() => [File])
        // TODO add scope guard for multiple files
        @SkipBuild()
        async moveDamFiles(
            @Args("fileIds", { type: () => [ID] }) fileIds: string[],
            @Args("targetFolderId", { type: () => ID, nullable: true }) targetFolderId: string,
        ): Promise<FileInterface[]> {
            return this.filesService.moveBatch(fileIds, targetFolderId);
        }

        @Mutation(() => File)
        @SubjectEntity(File)
        @SkipBuild()
        async archiveDamFile(@Args("id", { type: () => ID }) id: string): Promise<FileInterface> {
            const entity = await this.filesRepository.findOneOrFail(id);
            entity.archived = true;

            await this.filesRepository.persistAndFlush(entity);
            return entity;
        }

        @Mutation(() => File)
        @SubjectEntity(File)
        @SkipBuild()
        async restoreDamFile(@Args("id", { type: () => ID }) id: string): Promise<FileInterface> {
            const entity = await this.filesRepository.findOneOrFail(id);
            entity.archived = false;

            await this.filesRepository.persistAndFlush(entity);
            return entity;
        }

        @Mutation(() => Boolean)
        @SubjectEntity(File)
        @SkipBuild()
        async deleteDamFile(@Args("id", { type: () => ID }) id: string): Promise<boolean> {
            return this.filesService.delete(id);
        }

        @Query(() => Boolean)
        async damIsFilenameOccupied(
            @Args("filename") filename: string,
            @Args("scope", { type: () => Scope, defaultValue: hasNonEmptyScope ? undefined : {} }) scope: typeof Scope,
            @Args("folderId", { nullable: true }) folderId?: string,
        ): Promise<boolean> {
            const extension = extname(filename);
            const name = basename(filename, extension);
            const slugifiedName = slugifyFilename(name, extension);

            return (
                (await this.filesService.findOneByFilenameAndFolder({ filename: slugifiedName, folderId }, nonEmptyScopeOrNothing(scope))) !== null
            );
        }

        @Query(() => [FilenameResponse])
        async damAreFilenamesOccupied(
            @Args("filenames", { type: () => [FilenameInput] }) filenames: Array<FilenameInput>,
            @Args("scope", { type: () => Scope, defaultValue: hasNonEmptyScope ? undefined : {} }) scope: typeof Scope,
        ): Promise<Array<FilenameResponse>> {
            const response: Array<FilenameResponse> = [];

            for (const { name, folderId } of filenames) {
                const extension = extname(name);
                const filename = basename(name, extension);
                const slugifiedName = slugifyFilename(filename, extension);

                const existingFile = await this.filesService.findOneByFilenameAndFolder(
                    { filename: slugifiedName, folderId },
                    nonEmptyScopeOrNothing(scope),
                );
                const isOccupied = existingFile !== null;

                response.push({
                    name,
                    folderId,
                    isOccupied,
                });
            }

            return response;
        }

        @ResolveField(() => String)
        async fileUrl(@Parent() file: FileInterface): Promise<string> {
            return this.filesService.createFileUrl(file);
        }

        @ResolveField(() => [File])
        async duplicates(@Parent() file: FileInterface): Promise<FileInterface[]> {
            const files = await this.filesService.findAllByHash(file.contentHash);
            return files.filter((f) => f.id !== file.id);
        }

        @ResolveField(() => String)
        async damPath(@Parent() file: FileInterface): Promise<string> {
            return this.filesService.getDamPath(file);
        }
    }

    return FilesResolver;
}

import { Migration } from '@mikro-orm/migrations';

export class Migration20230808085034 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "DamFile" add column "sourceId" text null, add column "sourceType" text null;');
  }
}

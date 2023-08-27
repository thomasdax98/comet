import { Migration } from '@mikro-orm/migrations';

export class Migration20230827025030 extends Migration {

  async up(): Promise<void> {
    this.addSql('drop table if exists "Product" cascade;');

    this.addSql('drop table if exists "ProductCategory" cascade;');

    this.addSql('drop table if exists "ProductStatistics" cascade;');

    this.addSql('drop table if exists "ProductTag" cascade;');

    this.addSql('drop table if exists "ProductVariant" cascade;');

    this.addSql('drop table if exists "Product_tags" cascade;');
  }

  async down(): Promise<void> {
  }

}

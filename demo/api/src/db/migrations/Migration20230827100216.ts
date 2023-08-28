import { Migration } from '@mikro-orm/migrations';

export class Migration20230827100216 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "Customer" ("id" uuid not null, "firstname" varchar(255) not null, "lastname" varchar(255) not null, "email" varchar(255) not null, "address" varchar(255) not null, "createdAt" timestamp with time zone not null, "updatedAt" timestamp with time zone not null, constraint "Customer_pkey" primary key ("id"));');

    this.addSql('create table "Order" ("id" uuid not null, "totalAmountPaid" numeric(10,2) not null, "isPaid" boolean not null, "date" timestamptz(0) not null, "customer" uuid not null, "createdAt" timestamp with time zone not null, "updatedAt" timestamp with time zone not null, constraint "Order_pkey" primary key ("id"));');

    this.addSql('create table "Product" ("id" uuid not null, "name" varchar(255) not null, "description" varchar(255) not null, "price" numeric(10,2) not null, "type" text check ("type" in (\'Laptop\', \'Smartphone\', \'Smartwatch\')) not null, "image" json not null, "createdAt" timestamp with time zone not null, "updatedAt" timestamp with time zone not null, constraint "Product_pkey" primary key ("id"));');

    this.addSql('create table "Order_products" ("order" uuid not null, "product" uuid not null, constraint "Order_products_pkey" primary key ("order", "product"));');

    this.addSql('alter table "Order" add constraint "Order_customer_foreign" foreign key ("customer") references "Customer" ("id") on update cascade;');

    this.addSql('alter table "Order_products" add constraint "Order_products_order_foreign" foreign key ("order") references "Order" ("id") on update cascade on delete cascade;');
    this.addSql('alter table "Order_products" add constraint "Order_products_product_foreign" foreign key ("product") references "Product" ("id") on update cascade on delete cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "Order" drop constraint "Order_customer_foreign";');

    this.addSql('alter table "Order_products" drop constraint "Order_products_order_foreign";');

    this.addSql('alter table "Order_products" drop constraint "Order_products_product_foreign";');

    this.addSql('drop table if exists "Customer" cascade;');

    this.addSql('drop table if exists "Order" cascade;');

    this.addSql('drop table if exists "Product" cascade;');

    this.addSql('drop table if exists "Order_products" cascade;');
}

}

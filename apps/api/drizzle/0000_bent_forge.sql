CREATE SCHEMA "clinical";
--> statement-breakpoint
CREATE SCHEMA "core";
--> statement-breakpoint
CREATE SCHEMA "inventory";
--> statement-breakpoint
CREATE SCHEMA "sales";
--> statement-breakpoint
CREATE TYPE "clinical"."hospitalization_status" AS ENUM('ACTIVE', 'DISCHARGED', 'DECEASED');--> statement-breakpoint
CREATE TYPE "clinical"."record_status" AS ENUM('CONSULTATION', 'ADMITTED', 'DISCHARGED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "core"."business_unit_type" AS ENUM('VETERINARY', 'PHARMACY');--> statement-breakpoint
CREATE TYPE "core"."role_enum" AS ENUM('OWNER', 'ADMIN', 'VET', 'PHARMACIST', 'CASHIER');--> statement-breakpoint
CREATE TYPE "inventory"."movement_type" AS ENUM('PURCHASE_IN', 'SALE_OUT', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT');--> statement-breakpoint
CREATE TYPE "inventory"."product_type" AS ENUM('GOODS', 'SERVICE');--> statement-breakpoint
CREATE TYPE "sales"."expense_payment_method" AS ENUM('CASH', 'CARD', 'TRANSFER');--> statement-breakpoint
CREATE TYPE "sales"."payment_method" AS ENUM('CASH', 'CARD', 'TRANSFER', 'CREDIT');--> statement-breakpoint
CREATE TYPE "sales"."payment_status" AS ENUM('PAID', 'PENDING', 'PARTIAL');--> statement-breakpoint
CREATE TYPE "sales"."sale_status" AS ENUM('COMPLETED', 'VOIDED');--> statement-breakpoint
CREATE TABLE "clinical"."clinical_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"vet_id" uuid NOT NULL,
	"weight" numeric(5, 2),
	"temperature" numeric(4, 1),
	"reason" varchar(255) NOT NULL,
	"diagnosis" text,
	"prescription" text,
	"internal_notes" text,
	"status" "clinical"."record_status" DEFAULT 'CONSULTATION' NOT NULL,
	"hospitalization_id" uuid,
	"sale_id" uuid,
	"business_unit_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clinical"."hospitalization_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hospitalization_id" uuid NOT NULL,
	"description" varchar(255) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clinical"."hospitalization_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hospitalization_id" uuid NOT NULL,
	"vet_id" uuid NOT NULL,
	"weight" numeric(5, 2),
	"temperature" numeric(4, 1),
	"observations" text NOT NULL,
	"treatment" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clinical"."hospitalizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"vet_id" uuid NOT NULL,
	"reason" varchar(255) NOT NULL,
	"diagnosis" text,
	"admitted_at" timestamp DEFAULT now() NOT NULL,
	"discharged_at" timestamp,
	"estimated_days" integer,
	"daily_rate" numeric(10, 2),
	"status" "clinical"."hospitalization_status" DEFAULT 'ACTIVE' NOT NULL,
	"discharge_notes" text,
	"sale_id" uuid,
	"business_unit_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clinical"."patients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"species" varchar(50) NOT NULL,
	"breed" varchar(100),
	"sex" varchar(10),
	"color" varchar(50),
	"date_of_birth" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"client_id" uuid NOT NULL,
	"business_unit_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."business_units" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"type" "core"."business_unit_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "business_units_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "core"."refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."user_business_units" (
	"user_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"role" "core"."role_enum" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(50) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"phone_number" varchar(20),
	"password_hash" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "inventory"."categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"business_unit_id" uuid NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory"."products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_type" "inventory"."product_type" DEFAULT 'GOODS' NOT NULL,
	"barcode" varchar(50),
	"name" varchar(255) NOT NULL,
	"description" text,
	"category_id" uuid,
	"supplier_id" uuid,
	"cost_price" numeric(10, 2) NOT NULL,
	"profit_margin" numeric(5, 2) NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"stock_quantity" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_sample" boolean DEFAULT false NOT NULL,
	"is_regulated" boolean DEFAULT false NOT NULL,
	"business_unit_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory"."stock_movement" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "inventory"."movement_type" NOT NULL,
	"quantity" integer NOT NULL,
	"batch_number" varchar(100),
	"expiration_date" timestamp,
	"notes" text,
	"business_unit_id" uuid NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory"."suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(150) NOT NULL,
	"phone_number" varchar(20),
	"email" varchar(100),
	"business_unit_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales"."client" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100),
	"document_id" varchar(50),
	"phone_number" varchar(20),
	"business_unit_id" uuid NOT NULL,
	"credit_limit" numeric(10, 2) DEFAULT '0' NOT NULL,
	"balance_due" numeric(10, 2) DEFAULT '0' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales"."expense_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"business_unit_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales"."expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"description" varchar(255) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"category_id" uuid,
	"user_id" uuid NOT NULL,
	"business_unit_id" uuid NOT NULL,
	"expense_date" date DEFAULT now() NOT NULL,
	"payment_method" "sales"."expense_payment_method" DEFAULT 'CASH' NOT NULL,
	"reference_number" varchar(255),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales"."payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sale_id" uuid,
	"client_id" uuid,
	"user_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"payment_method" "sales"."payment_method" NOT NULL,
	"reference_number" varchar(255),
	"business_unit_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales"."sales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid,
	"user_id" uuid NOT NULL,
	"sub_total" numeric(10, 2) NOT NULL,
	"discount_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"payment_method" "sales"."payment_method" DEFAULT 'CASH' NOT NULL,
	"payment_status" "sales"."payment_status" DEFAULT 'PAID' NOT NULL,
	"due_date" timestamp,
	"status" "sales"."sale_status" DEFAULT 'COMPLETED' NOT NULL,
	"business_unit_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales"."sales_details" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sale_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"line_discount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"business_unit_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "clinical"."clinical_records" ADD CONSTRAINT "clinical_records_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "clinical"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical"."clinical_records" ADD CONSTRAINT "clinical_records_vet_id_users_id_fk" FOREIGN KEY ("vet_id") REFERENCES "core"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical"."clinical_records" ADD CONSTRAINT "clinical_records_hospitalization_id_hospitalizations_id_fk" FOREIGN KEY ("hospitalization_id") REFERENCES "clinical"."hospitalizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical"."clinical_records" ADD CONSTRAINT "clinical_records_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "sales"."sales"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical"."clinical_records" ADD CONSTRAINT "clinical_records_business_unit_id_business_units_id_fk" FOREIGN KEY ("business_unit_id") REFERENCES "core"."business_units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical"."hospitalization_items" ADD CONSTRAINT "hospitalization_items_hospitalization_id_hospitalizations_id_fk" FOREIGN KEY ("hospitalization_id") REFERENCES "clinical"."hospitalizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical"."hospitalization_notes" ADD CONSTRAINT "hospitalization_notes_hospitalization_id_hospitalizations_id_fk" FOREIGN KEY ("hospitalization_id") REFERENCES "clinical"."hospitalizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical"."hospitalization_notes" ADD CONSTRAINT "hospitalization_notes_vet_id_users_id_fk" FOREIGN KEY ("vet_id") REFERENCES "core"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical"."hospitalizations" ADD CONSTRAINT "hospitalizations_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "clinical"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical"."hospitalizations" ADD CONSTRAINT "hospitalizations_vet_id_users_id_fk" FOREIGN KEY ("vet_id") REFERENCES "core"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical"."hospitalizations" ADD CONSTRAINT "hospitalizations_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "sales"."sales"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical"."hospitalizations" ADD CONSTRAINT "hospitalizations_business_unit_id_business_units_id_fk" FOREIGN KEY ("business_unit_id") REFERENCES "core"."business_units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical"."patients" ADD CONSTRAINT "patients_client_id_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "sales"."client"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical"."patients" ADD CONSTRAINT "patients_business_unit_id_business_units_id_fk" FOREIGN KEY ("business_unit_id") REFERENCES "core"."business_units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "core"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."user_business_units" ADD CONSTRAINT "user_business_units_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "core"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."user_business_units" ADD CONSTRAINT "user_business_units_business_id_business_units_id_fk" FOREIGN KEY ("business_id") REFERENCES "core"."business_units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory"."categories" ADD CONSTRAINT "categories_business_unit_id_business_units_id_fk" FOREIGN KEY ("business_unit_id") REFERENCES "core"."business_units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory"."products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "inventory"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory"."products" ADD CONSTRAINT "products_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "inventory"."suppliers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory"."products" ADD CONSTRAINT "products_business_unit_id_business_units_id_fk" FOREIGN KEY ("business_unit_id") REFERENCES "core"."business_units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory"."stock_movement" ADD CONSTRAINT "stock_movement_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "inventory"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory"."stock_movement" ADD CONSTRAINT "stock_movement_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "core"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory"."stock_movement" ADD CONSTRAINT "stock_movement_business_unit_id_business_units_id_fk" FOREIGN KEY ("business_unit_id") REFERENCES "core"."business_units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory"."suppliers" ADD CONSTRAINT "suppliers_business_unit_id_business_units_id_fk" FOREIGN KEY ("business_unit_id") REFERENCES "core"."business_units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales"."client" ADD CONSTRAINT "client_business_unit_id_business_units_id_fk" FOREIGN KEY ("business_unit_id") REFERENCES "core"."business_units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales"."expense_categories" ADD CONSTRAINT "expense_categories_business_unit_id_business_units_id_fk" FOREIGN KEY ("business_unit_id") REFERENCES "core"."business_units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales"."expenses" ADD CONSTRAINT "expenses_category_id_expense_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "sales"."expense_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales"."expenses" ADD CONSTRAINT "expenses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "core"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales"."expenses" ADD CONSTRAINT "expenses_business_unit_id_business_units_id_fk" FOREIGN KEY ("business_unit_id") REFERENCES "core"."business_units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales"."payments" ADD CONSTRAINT "payments_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "sales"."sales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales"."payments" ADD CONSTRAINT "payments_client_id_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "sales"."client"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales"."payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "core"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales"."payments" ADD CONSTRAINT "payments_business_unit_id_business_units_id_fk" FOREIGN KEY ("business_unit_id") REFERENCES "core"."business_units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales"."sales" ADD CONSTRAINT "sales_client_id_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "sales"."client"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales"."sales" ADD CONSTRAINT "sales_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "core"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales"."sales" ADD CONSTRAINT "sales_business_unit_id_business_units_id_fk" FOREIGN KEY ("business_unit_id") REFERENCES "core"."business_units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales"."sales_details" ADD CONSTRAINT "sales_details_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "sales"."sales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales"."sales_details" ADD CONSTRAINT "sales_details_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "inventory"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales"."sales_details" ADD CONSTRAINT "sales_details_business_unit_id_business_units_id_fk" FOREIGN KEY ("business_unit_id") REFERENCES "core"."business_units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_business_units_user_id_business_id_idx" ON "core"."user_business_units" USING btree ("user_id","business_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_bu_unique_idx" ON "core"."user_business_units" USING btree ("user_id","business_id");
CREATE TABLE "appliances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"brand" varchar(255) NOT NULL,
	"model" varchar(255) NOT NULL,
	"serial_number" varchar(255),
	"purchase_date" date NOT NULL,
	"warranty_period_months" integer NOT NULL,
	"warranty_expiry" date NOT NULL,
	"purchase_location" varchar(255),
	"manual_link" text,
	"receipt_link" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appliance_id" uuid NOT NULL,
	"contact_name" varchar(255) NOT NULL,
	"phone" varchar(50),
	"email" varchar(255),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenance_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appliance_id" uuid NOT NULL,
	"task_name" varchar(255) NOT NULL,
	"date" date NOT NULL,
	"frequency" varchar(50) NOT NULL,
	"service_provider_name" varchar(255) NOT NULL,
	"service_provider_contact" varchar(255) NOT NULL,
	"reminder_date" date NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_appliance_id_appliances_id_fk" FOREIGN KEY ("appliance_id") REFERENCES "public"."appliances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_tasks" ADD CONSTRAINT "maintenance_tasks_appliance_id_appliances_id_fk" FOREIGN KEY ("appliance_id") REFERENCES "public"."appliances"("id") ON DELETE cascade ON UPDATE no action;
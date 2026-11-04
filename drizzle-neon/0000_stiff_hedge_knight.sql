CREATE TYPE "omaluxe"."discount_type" AS ENUM('percentage', 'fixed');--> statement-breakpoint
CREATE TYPE "omaluxe"."notification_type" AS ENUM('order_placed', 'order_updated', 'promotion', 'new_arrival', 'system');--> statement-breakpoint
CREATE TYPE "omaluxe"."order_status" AS ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "omaluxe"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "omaluxe"."cart_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"productId" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"selectedSize" varchar(64),
	"price" numeric(10, 2) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "omaluxe"."categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"slug" varchar(128) NOT NULL,
	"description" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "omaluxe"."coupons" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(64) NOT NULL,
	"description" text,
	"discountType" "omaluxe"."discount_type" NOT NULL,
	"discountValue" numeric(10, 2) NOT NULL,
	"maxUses" integer,
	"currentUses" integer DEFAULT 0 NOT NULL,
	"minOrderValue" numeric(10, 2),
	"expiresAt" timestamp with time zone,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "omaluxe"."notification_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"orderUpdates" boolean DEFAULT true NOT NULL,
	"promotions" boolean DEFAULT true NOT NULL,
	"newArrivals" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notification_preferences_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "omaluxe"."notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"type" "omaluxe"."notification_type" NOT NULL,
	"title" varchar(256) NOT NULL,
	"message" text NOT NULL,
	"isRead" boolean DEFAULT false NOT NULL,
	"orderId" integer,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "omaluxe"."order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"orderId" integer NOT NULL,
	"productId" integer NOT NULL,
	"productName" varchar(256) NOT NULL,
	"selectedSize" varchar(64),
	"quantity" integer NOT NULL,
	"unitPrice" numeric(10, 2) NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "omaluxe"."orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"customerName" varchar(256) NOT NULL,
	"customerEmail" varchar(320) NOT NULL,
	"customerPhone" varchar(32),
	"shippingAddress" text NOT NULL,
	"city" varchar(128),
	"country" varchar(128),
	"postalCode" varchar(32),
	"subtotal" numeric(10, 2) NOT NULL,
	"shipping" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"status" "omaluxe"."order_status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "omaluxe"."products" (
	"id" serial PRIMARY KEY NOT NULL,
	"categoryId" integer,
	"name" varchar(256) NOT NULL,
	"slug" varchar(256) NOT NULL,
	"description" text,
	"scentNotes" text,
	"burnTime" varchar(64),
	"imageUrl" text,
	"price" numeric(10, 2) NOT NULL,
	"sizes" json,
	"isFeatured" boolean DEFAULT false NOT NULL,
	"isBestseller" boolean DEFAULT false NOT NULL,
	"stock" integer DEFAULT 100 NOT NULL,
	"mood" varchar(128),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "omaluxe"."reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer NOT NULL,
	"userId" integer NOT NULL,
	"rating" integer NOT NULL,
	"title" varchar(256),
	"comment" text,
	"helpful" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "omaluxe"."users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "omaluxe"."user_role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
CREATE TABLE "omaluxe"."wishlist_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"productId" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);

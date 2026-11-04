CREATE TABLE "omaluxe"."newsletter_subscribers" (
  "id" serial PRIMARY KEY NOT NULL,
  "email" varchar(320) NOT NULL,
  "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "newsletter_subscribers_email_unique" UNIQUE("email")
);

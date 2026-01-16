-- Create zones table
create table "public"."zones" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "display_name_en" text not null,
    "display_name_hi" text not null,
    "created_at" timestamp with time zone default now(),
    constraint "zones_pkey" primary key ("id"),
    constraint "zones_name_key" unique ("name")
);

-- Enable RLS
alter table "public"."zones" enable row level security;

-- Create policy for public read access
create policy "Enable read access for all users"
    on "public"."zones"
    as permissive
    for select
    to public
    using (true);

-- Insert seed data
insert into "public"."zones" ("name", "display_name_en", "display_name_hi") values
    ('Zone A', 'Chandni Chowk', 'चांदनी चौक'),
    ('Zone B', 'Karol Bagh', 'करोल बाग'),
    ('Zone C', 'Lajpat Nagar', 'लाजपत नगर'),
    ('Zone D', 'Ghazipur Mandi', 'गाजीपुर मंडी'),
    ('Zone E', 'Saket', 'साकेत'),
    ('Zone F', 'Dwarka', 'द्वारका');

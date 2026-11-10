-- ============================================================
-- E-Commerce Schema
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- Required extension for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Table: products
-- ------------------------------------------------------------
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  price       integer not null check (price >= 0),
  image_url   text,
  category    text not null,
  stock       integer not null default 0 check (stock >= 0),
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Table: orders
-- ------------------------------------------------------------
create table if not exists public.orders (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  total      integer not null default 0 check (total >= 0),
  status     text not null default 'pending',
  address    text not null,
  created_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- ------------------------------------------------------------
-- Table: order_items
-- ------------------------------------------------------------
create table if not exists public.order_items (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references public.orders (id) on delete cascade,
  product_id       uuid not null references public.products (id),
  qty              integer not null check (qty > 0),
  price_at_purchase integer not null check (price_at_purchase >= 0)
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- ------------------------------------------------------------
-- Policies: products (public read)
-- ------------------------------------------------------------
drop policy if exists "products_select_public" on public.products;
create policy "products_select_public"
  on public.products
  for select
  using (true);

-- ------------------------------------------------------------
-- Policies: orders (owner only)
-- ------------------------------------------------------------
drop policy if exists "orders_select_owner" on public.orders;
create policy "orders_select_owner"
  on public.orders
  for select
  using (auth.uid() = user_id);

drop policy if exists "orders_insert_owner" on public.orders;
create policy "orders_insert_owner"
  on public.orders
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "orders_update_owner" on public.orders;
create policy "orders_update_owner"
  on public.orders
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "orders_delete_owner" on public.orders;
create policy "orders_delete_owner"
  on public.orders
  for delete
  using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- Policies: order_items (owner of the parent order only)
-- ------------------------------------------------------------
drop policy if exists "order_items_select_owner" on public.order_items;
create policy "order_items_select_owner"
  on public.order_items
  for select
  using (
    exists (
      select 1
      from public.orders o
      where o.id = order_items.order_id
        and o.user_id = auth.uid()
    )
  );

drop policy if exists "order_items_insert_owner" on public.order_items;
create policy "order_items_insert_owner"
  on public.order_items
  for insert
  with check (
    exists (
      select 1
      from public.orders o
      where o.id = order_items.order_id
        and o.user_id = auth.uid()
    )
  );

drop policy if exists "order_items_delete_owner" on public.order_items;
create policy "order_items_delete_owner"
  on public.order_items
  for delete
  using (
    exists (
      select 1
      from public.orders o
      where o.id = order_items.order_id
        and o.user_id = auth.uid()
    )
  );

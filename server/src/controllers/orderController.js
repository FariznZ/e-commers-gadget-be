'use strict';

const { supabase } = require('../lib/supabase');

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

async function createOrder(req, res) {
  try {
    const { address, items } = req.body || {};

    // ---- Validate input ----
    if (typeof address !== 'string' || address.trim() === '') {
      return res.status(400).json({ error: 'Alamat wajib diisi' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items tidak boleh kosong' });
    }

    // Merge duplicate product_id and validate each item.
    const mergedItems = new Map();

    for (const item of items) {
      if (!item || typeof item !== 'object') {
        return res.status(400).json({ error: 'Format item tidak valid' });
      }

      const { product_id, qty } = item;

      if (typeof product_id !== 'string' || !UUID_REGEX.test(product_id)) {
        return res.status(400).json({ error: 'product_id tidak valid' });
      }

      if (!isPositiveInteger(qty)) {
        return res.status(400).json({ error: 'qty harus bilangan bulat > 0' });
      }

      const current = mergedItems.get(product_id) || 0;
      mergedItems.set(product_id, current + qty);
    }

    const productIds = Array.from(mergedItems.keys());

    // ---- Fetch prices from database (never trust FE prices) ----
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, stock')
      .in('id', productIds);

    if (productsError) {
      return res.status(500).json({ error: productsError.message });
    }

    const productMap = new Map((products || []).map((p) => [p.id, p]));

    let total = 0;
    const orderItemsPayload = [];

    for (const [productId, qty] of mergedItems.entries()) {
      const product = productMap.get(productId);

      if (!product) {
        return res
          .status(400)
          .json({ error: `Produk tidak ditemukan: ${productId}` });
      }

      if (typeof product.stock === 'number' && qty > product.stock) {
        return res.status(400).json({
          error: `Stok tidak cukup untuk produk: ${product.name}`,
        });
      }

      total += product.price * qty;

      orderItemsPayload.push({
        product_id: productId,
        qty,
        price_at_purchase: product.price,
      });
    }

    // ---- Insert order ----
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: req.user.id,
        total,
        status: 'pending',
        address: address.trim(),
      })
      .select('id, total, status, address')
      .single();

    if (orderError) {
      return res.status(500).json({ error: orderError.message });
    }

    // ---- Insert order items ----
    const rows = orderItemsPayload.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      qty: item.qty,
      price_at_purchase: item.price_at_purchase,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(rows);

    if (itemsError) {
      // Rollback the order so we don't leave an orphan order behind.
      await supabase.from('orders').delete().eq('id', order.id);
      return res.status(500).json({ error: itemsError.message });
    }

    return res.status(201).json({
      data: {
        id: order.id,
        total: order.total,
        status: order.status,
        address: order.address,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getOrders(req, res) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('id, total, status, created_at')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ data: data || [] });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getOrder(req, res) {
  try {
    const { id } = req.params;

    if (!UUID_REGEX.test(id)) {
      return res.status(404).json({ error: 'Order tidak ditemukan' });
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, total, status, address')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (orderError) {
      return res.status(500).json({ error: orderError.message });
    }

    if (!order) {
      return res.status(404).json({ error: 'Order tidak ditemukan' });
    }

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('qty, price_at_purchase, products ( name )')
      .eq('order_id', id);

    if (itemsError) {
      return res.status(500).json({ error: itemsError.message });
    }

    const normalizedItems = (items || []).map((row) => ({
      name: row.products ? row.products.name : null,
      qty: row.qty,
      price_at_purchase: row.price_at_purchase,
    }));

    return res.status(200).json({
      data: {
        id: order.id,
        total: order.total,
        status: order.status,
        address: order.address,
        items: normalizedItems,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function payOrder(req, res) {
  try {
    const { id } = req.params;

    if (!UUID_REGEX.test(id)) {
      return res.status(404).json({ error: 'Order tidak ditemukan' });
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (orderError) {
      return res.status(500).json({ error: orderError.message });
    }

    if (!order) {
      return res.status(404).json({ error: 'Order tidak ditemukan' });
    }

    if (order.status !== 'pending') {
      return res
        .status(400)
        .json({ error: 'Order tidak dapat dibayar (status bukan pending)' });
    }

    const { data: updated, error: updateError } = await supabase
      .from('orders')
      .update({ status: 'paid' })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select('id, status')
      .single();

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    return res.status(200).json({
      data: { id: updated.id, status: updated.status },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { createOrder, getOrders, getOrder, payOrder };

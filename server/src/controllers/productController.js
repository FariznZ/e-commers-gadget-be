'use strict';

const { supabase } = require('../lib/supabase');

const LIST_FIELDS = 'id, name, price, image_url, category, stock';
const DETAIL_FIELDS =
  'id, name, description, price, image_url, category, stock';

async function listProducts(req, res) {
  try {
    const { category, search } = req.query;

    let query = supabase.from('products').select(LIST_FIELDS);

    if (category && String(category).trim() !== '') {
      query = query.eq('category', String(category).trim());
    }

    if (search && String(search).trim() !== '') {
      query = query.ilike('name', `%${String(search).trim()}%`);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ data: data || [] });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getProduct(req, res) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('products')
      .select(DETAIL_FIELDS)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Produk tidak ditemukan' });
    }

    return res.status(200).json({ data });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getCategories(req, res) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .order('created_at', { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const categories = [];
    for (const row of data || []) {
      if (row.category && !categories.includes(row.category)) {
        categories.push(row.category);
      }
    }

    return res.status(200).json({ data: categories });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { listProducts, getProduct, getCategories };

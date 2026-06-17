import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gwvmzlzdbkkfpntbixmi.supabase.co'; // например: https://xxxxx.supabase.co
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3dm16bHpkYmtrZnBudGJpeG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1OTQwNTUsImV4cCI6MjA5NzE3MDA1NX0.1iSgnEXcnyhdw_xYCbvvXyS_-PHbFna4HHP-W6Mt_Yo'; // длинная строка

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Функция сохранения заказа
export async function saveOrder(orderData) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error saving order:', error);
    return { success: false, error: error.message };
  }
}

// Функция получения истории заказов
export async function getOrders(userId) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}


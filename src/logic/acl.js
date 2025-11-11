// src/logic/acl.js
// Encapsula llamadas a la Edge Function manage_acls
// Asume uso del SDK de Supabase v1 (window.supabase)

const SUPABASE_FUNCTION_URL = 'https://vicmgzclxyfjrlzgasqn.supabase.co/functions/v1/manage_acls';

/**
 * Obtiene el token de sesión actual usando el SDK v1.
 * Devuelve null si no hay sesión.
 */
export async function getTokenV1() {
  if (!window.supabase || !window.supabase.auth) return null;
  try {
    const session = window.supabase.auth.session?.() ?? null;
    return session?.access_token ?? null;
  } catch (e) {
    console.warn('getTokenV1 fallback error', e);
    return null;
  }
}

/**
 * Llama a la Edge Function manage_acls con Authorization header.
 * action: 'add' | 'remove'
 * target: 'wall' | 'post'
 * id: wall UUID o post id (según target)
 * user_id: UUID del user objetivo
 */
export async function manageAcl({ action, target, id, user_id }) {
  if (!['add', 'remove'].includes(action)) throw new Error('Invalid action');
  if (!['wall', 'post'].includes(target)) throw new Error('Invalid target');
  if (!id) throw new Error('Missing id');
  if (!user_id) throw new Error('Missing user_id');

  const token = await getTokenV1();
  if (!token) {
    const err = new Error('Not authenticated');
    err.status = 401;
    throw err;
  }

  const res = await fetch(SUPABASE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ action, target, id, user_id }),
  });

  let payloadText;
  try { payloadText = await res.text(); } catch (_) { payloadText = null; }

  if (!res.ok) {
    let parsed = null;
    try { parsed = JSON.parse(payloadText); } catch (_) {}
    const message = parsed?.message || parsed?.error || payloadText || `HTTP ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  try {
    return JSON.parse(payloadText);
  } catch (_) {
    return payloadText;
  }
}

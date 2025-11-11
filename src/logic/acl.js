// src/logic/acl.js
// Encapsula llamadas a la Edge Function manage_acls
// Diseñado para ser cargado como <script src="src/logic/acl.js"></script> (no-module)

(function () {
  const SUPABASE_FUNCTION_URL = 'https://vicmgzclxyfjrlzgasqn.supabase.co/functions/v1/manage_acls';

  /**
   * Obtiene el token de sesión actual usando el SDK v1.
   * Devuelve null si no hay sesión.
   */
  async function getTokenV1() {
    if (!window.supabase || !window.supabase.auth) return null;
    try {
      // SDK v1: session() es función que devuelve objeto { access_token, ... }
      const session = (typeof window.supabase.auth.session === 'function') ? window.supabase.auth.session() : null;
      return session?.access_token ?? null;
    } catch (e) {
      console.warn('getTokenV1 fallback error', e);
      return null;
    }
  }

  /**
   * Llama a la Edge Function manage_acls con Authorization header.
   * Params:
   *  - action: 'add' | 'remove'
   *  - target: 'wall' | 'post'
   *  - id: wall UUID o post id (según target)
   *  - user_id: UUID del user objetivo
   */
  async function manageAcl({ action, target, id, user_id }) {
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

  // Exponer globalmente para uso desde app.js sin módulos
  if (typeof window !== 'undefined') {
    window.__acl = window.__acl || {};
    window.__acl.getTokenV1 = getTokenV1;
    window.__acl.manageAcl = manageAcl;
  }
})();

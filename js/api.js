/**
 * JANTA PRINTS — API & INTEGRATION CONFIG
 * ════════════════════════════════════════════════════════════════
 * This is the ONLY file you edit when connecting to a live backend.
 * All pages import this and call JP.API.* — nothing else changes.
 *
 * HOW TO WIRE UP:
 *   1. Set JP_API_BASE to your deployed API URL
 *   2. Fill in each handler (replace the demo setTimeout with real fetch)
 *   3. For auth: swap JP.Auth stubs with Supabase / NextAuth calls
 *   4. For M-Pesa: implement JP.API.mpesa.stkPush()
 *
 * PROVIDERS REFERENCED:
 *   Backend API    → https://api.jantaprints.co.ke  (FastAPI on Railway)
 *   Auth           → Supabase Auth  https://supabase.com/docs/guides/auth
 *   Email          → Resend         https://resend.com/docs
 *   SMS            → Africa's Talking https://africastalking.com
 *   Payments       → M-Pesa Daraja  https://developer.safaricom.co.ke
 *   File storage   → Supabase Storage
 * ════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  window.JP = window.JP || {};

  /* ── Environment ───────────────────────────────────────────── */
  var ENV = {
    // ↓ Change this to your live API URL when deploying
    API_BASE:         window.JP_API_BASE        || 'https://api.jantaprints.co.ke',
    STUDIO_API:       window.JP_STUDIO_API_BASE || 'https://api.jantaprints.co.ke',
    WHATSAPP_NUMBER:  window.JP_WHATSAPP        || '254700000000',
    SITE_NAME:        'Janta Prints',
    // Feature flags — flip to true once the backend is live
    FEATURES: {
      realAuth:        false,  // ← set true once Supabase is configured
      realQuoteSubmit: false,  // ← set true once quote API is ready
      realContactForm: false,  // ← set true once email API is ready
      mpesaPayments:   false,  // ← set true once Daraja sandbox is ready
      orderTracking:   false,  // ← set true once order status API is ready
    }
  };

  JP.ENV = ENV;

  /* ════════════════════════════════════════════════════════════
     AUTH — swap stub with Supabase Auth
     ════════════════════════════════════════════════════════════ */
  JP.Auth = {
    /**
     * Sign in with email + password.
     * @returns {Promise<{user, session, error}>}
     *
     * PRODUCTION — replace body with:
     *   const { data, error } = await supabase.auth.signInWithPassword({ email, password });
     *   return { user: data.user, session: data.session, error };
     */
    signIn: async function (email, password) {
      if (ENV.FEATURES.realAuth) {
        // → replace with: const { data, error } = await supabase.auth.signInWithPassword(...)
        throw new Error('Real auth not yet configured — set JP.ENV.FEATURES.realAuth = true and wire Supabase');
      }
      // DEMO stub — returns fake user after 800ms
      await _delay(800);
      var user = { id: 'demo-001', email: email, name: 'Grace Akinyi', company: 'Lake Events Ltd' };
      _setSession(user);
      return { user: user, error: null };
    },

    /**
     * Register new account.
     * PRODUCTION → supabase.auth.signUp({ email, password, options: { data: { name, phone } } })
     */
    register: async function (email, password, meta) {
      if (ENV.FEATURES.realAuth) {
        throw new Error('Wire Supabase auth.signUp');
      }
      await _delay(1000);
      return { user: { email: email, ...meta }, error: null };
    },

    /** Sign out. PRODUCTION → supabase.auth.signOut() */
    signOut: async function () {
      _clearSession();
      return { error: null };
    },

    /** Get current user from session storage. */
    getUser: function () {
      try { return JSON.parse(sessionStorage.getItem('jp_user')); }
      catch (e) { return null; }
    },

    /** Returns true if a session exists. */
    isLoggedIn: function () { return !!JP.Auth.getUser(); },

    /**
     * Reset password email.
     * PRODUCTION → supabase.auth.resetPasswordForEmail(email)
     */
    resetPassword: async function (email) {
      await _delay(600);
      return { error: null };
    }
  };

  function _setSession(user) { sessionStorage.setItem('jp_user', JSON.stringify(user)); }
  function _clearSession()   { sessionStorage.removeItem('jp_user'); }


  /* ════════════════════════════════════════════════════════════
     QUOTE API
     ════════════════════════════════════════════════════════════ */
  JP.API = JP.API || {};

  /**
   * Submit a quote request.
   * @param {Object} payload  — full quote form data (product, qty, specs, contact, artwork)
   * @returns {Promise<{quoteId, error}>}
   *
   * PRODUCTION — replace body with:
   *   const fd = new FormData();
   *   Object.entries(payload).forEach(([k,v]) => fd.append(k, v));
   *   if (payload.artworkFile) fd.append('artwork', payload.artworkFile);
   *   const resp = await fetch(JP.ENV.API_BASE + '/quotes', { method: 'POST', body: fd });
   *   const data = await resp.json();
   *   return { quoteId: data.id, error: data.error };
   */
  JP.API.submitQuote = async function (payload) {
    if (ENV.FEATURES.realQuoteSubmit) {
      var fd = new FormData();
      Object.entries(payload).forEach(function (kv) {
        if (kv[1] !== null && kv[1] !== undefined) fd.append(kv[0], kv[1]);
      });
      var resp = await fetch(ENV.API_BASE + '/quotes', { method: 'POST', body: fd });
      if (!resp.ok) return { quoteId: null, error: 'Server error: ' + resp.status };
      var data = await resp.json();
      return { quoteId: data.id, error: null };
    }
    // DEMO
    await _delay(1400);
    var id = 'QT-DEMO-' + Date.now().toString(36).toUpperCase();
    console.log('[JP.API.submitQuote] Demo mode — payload:', payload, '→ ID:', id);
    return { quoteId: id, error: null };
  };


  /* ════════════════════════════════════════════════════════════
     CONTACT FORM API
     ════════════════════════════════════════════════════════════ */
  /**
   * Submit contact form message.
   * @param {Object} payload — { fname, lname, email, phone, subject, message }
   *
   * PRODUCTION OPTIONS:
   *   A) EmailJS (no backend needed):
   *      emailjs.send('service_id', 'template_id', payload, 'public_key')
   *
   *   B) Formspree:
   *      fetch('https://formspree.io/f/YOUR_FORM_ID', {
   *        method: 'POST', headers: { 'Content-Type': 'application/json' },
   *        body: JSON.stringify(payload)
   *      })
   *
   *   C) Your own API:
   *      fetch(JP.ENV.API_BASE + '/contact', { method: 'POST', body: JSON.stringify(payload),
   *        headers: { 'Content-Type': 'application/json' } })
   */
  JP.API.submitContact = async function (payload) {
    if (ENV.FEATURES.realContactForm) {
      var resp = await fetch(ENV.API_BASE + '/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return { ok: resp.ok, error: resp.ok ? null : 'Send failed' };
    }
    await _delay(1200);
    console.log('[JP.API.submitContact] Demo mode — payload:', payload);
    return { ok: true, error: null };
  };


  /* ════════════════════════════════════════════════════════════
     ORDER TRACKING API
     ════════════════════════════════════════════════════════════ */
  /**
   * Fetch order status by order ID or phone number.
   * PRODUCTION → fetch(JP.ENV.API_BASE + '/orders/' + id)
   */
  JP.API.getOrderStatus = async function (orderIdOrPhone) {
    if (ENV.FEATURES.orderTracking) {
      var resp = await fetch(ENV.API_BASE + '/orders/' + encodeURIComponent(orderIdOrPhone));
      return await resp.json();
    }
    await _delay(900);
    // Demo stub data
    return {
      id: orderIdOrPhone.toUpperCase(),
      product: 'Football Jerseys × 22',
      status: 'production',
      statusLabel: 'In Production',
      progress: 65,
      submittedAt: '14 Mar 2026',
      expectedAt: '21 Mar 2026',
      steps: [
        { label: 'Order received',   done: true,  date: '14 Mar' },
        { label: 'Artwork approved', done: true,  date: '15 Mar' },
        { label: 'In production',    done: false, date: 'Est. 18 Mar' },
        { label: 'Quality check',    done: false, date: 'Est. 20 Mar' },
        { label: 'Ready / Delivered',done: false, date: 'Est. 21 Mar' },
      ]
    };
  };

  /**
   * Fetch all orders for logged-in user.
   * PRODUCTION → fetch(JP.ENV.API_BASE + '/orders?userId=' + user.id)
   */
  JP.API.getMyOrders = async function () {
    if (ENV.FEATURES.orderTracking) {
      var user = JP.Auth.getUser();
      var resp = await fetch(ENV.API_BASE + '/orders?userId=' + user.id, {
        headers: { 'Authorization': 'Bearer ' + user.accessToken }
      });
      return await resp.json();
    }
    await _delay(600);
    return DEMO_ORDERS;
  };

  var DEMO_ORDERS = [
    { id: 'JP-2026-007', product: 'Pull-up Banner × 2',    status: 'production', statusLabel: 'In Production', date: '20 Mar 2026', amount: 'KES 9,600' },
    { id: 'JP-2026-006', product: 'Football Jersey × 22',  status: 'review',     statusLabel: 'Artwork Review', date: '14 Mar 2026', amount: 'KES 30,800' },
    { id: 'JP-2026-005', product: 'Business Cards × 500',  status: 'delivered',  statusLabel: 'Delivered',      date: '8 Mar 2026',  amount: 'KES 4,500' },
    { id: 'JP-2026-004', product: 'A5 Flyers × 1000',      status: 'delivered',  statusLabel: 'Delivered',      date: '28 Feb 2026', amount: 'KES 18,000' },
    { id: 'JP-2026-003', product: 'Rugby Jerseys × 30',    status: 'delivered',  statusLabel: 'Delivered',      date: '10 Feb 2026', amount: 'KES 39,000' },
  ];


  /* ════════════════════════════════════════════════════════════
     M-PESA DARAJA API
     ════════════════════════════════════════════════════════════ */
  /**
   * Initiate M-Pesa STK Push for order payment.
   * This MUST go through your backend — never call Daraja from frontend directly.
   *
   * @param {Object} params — { phone, amount, orderId, description }
   * @returns {Promise<{checkoutRequestId, error}>}
   *
   * PRODUCTION — your backend endpoint calls:
   *   POST https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest
   *   with BusinessShortCode, Password, Timestamp, TransactionType,
   *        Amount, PartyA, PartyB, PhoneNumber, CallBackURL, etc.
   *
   * Your backend must also expose a webhook for Daraja callbacks:
   *   POST /payments/mpesa-callback
   */
  JP.API.mpesa = {
    stkPush: async function (params) {
      if (ENV.FEATURES.mpesaPayments) {
        var resp = await fetch(ENV.API_BASE + '/payments/mpesa/stk-push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params)
        });
        var data = await resp.json();
        return { checkoutRequestId: data.CheckoutRequestID, error: data.errorMessage || null };
      }
      await _delay(1000);
      console.log('[JP.API.mpesa.stkPush] Demo mode — params:', params);
      return { checkoutRequestId: 'ws_CO_DEMO_' + Date.now(), error: null };
    },

    /** Poll payment status by CheckoutRequestID. */
    queryStatus: async function (checkoutRequestId) {
      if (ENV.FEATURES.mpesaPayments) {
        var resp = await fetch(ENV.API_BASE + '/payments/mpesa/status/' + checkoutRequestId);
        return await resp.json();
      }
      await _delay(500);
      return { status: 'pending' };
    }
  };


  /* ════════════════════════════════════════════════════════════
     FILE UPLOADS (Supabase Storage)
     ════════════════════════════════════════════════════════════ */
  /**
   * Upload artwork file to Supabase Storage.
   * PRODUCTION:
   *   const { data, error } = await supabase.storage
   *     .from('artwork')
   *     .upload(`orders/${orderId}/${file.name}`, file, { upsert: true });
   *   return { url: data.path, error };
   */
  JP.API.uploadArtwork = async function (file, orderId) {
    if (ENV.FEATURES.realQuoteSubmit) {
      // Wire Supabase storage here
      throw new Error('Wire Supabase storage upload');
    }
    await _delay(800);
    console.log('[JP.API.uploadArtwork] Demo — file:', file.name, 'orderId:', orderId);
    return { url: 'demo://artwork/' + file.name, error: null };
  };


  /* ════════════════════════════════════════════════════════════
     NEWSLETTER / MAILING LIST
     ════════════════════════════════════════════════════════════ */
  /**
   * Subscribe email to mailing list.
   * PRODUCTION → Mailchimp / Brevo / Resend Audiences API
   */
  JP.API.subscribe = async function (email, name) {
    await _delay(700);
    console.log('[JP.API.subscribe] Demo — email:', email);
    return { ok: true, error: null };
  };


  /* ════════════════════════════════════════════════════════════
     HELPERS (internal)
     ════════════════════════════════════════════════════════════ */
  function _delay(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* Expose env check for pages */
  JP.isDemo = function (feature) {
    return !ENV.FEATURES[feature];
  };

})();

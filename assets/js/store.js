/*
  Data layer. Works in two modes:
   - LIVE  : Supabase (free tier) when SUPABASE_URL + SUPABASE_ANON_KEY are set in config.js
   - DEMO  : browser localStorage, starting from seed.js
  The site and admin only talk to window.Store, so they work the same in both modes.
*/
(function () {
  const cfg = window.SITE_CONFIG || {};
  const LIVE = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase && window.supabase.createClient);
  const sb = LIVE ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;
  const DB_KEY = "mua_demo_db_v4";
  const AUTH_KEY = "mua_demo_auth_v1";
  const TABLES = ["posts", "offers", "services", "bookings"];

  const clone = (o) => JSON.parse(JSON.stringify(o));
  const now = () => new Date().toISOString();
  const uid = () => (window.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 10));

  /* ---------- demo storage ---------- */
  let mem = null;
  function db() {
    if (mem) return mem;
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (raw) { mem = JSON.parse(raw); }
    } catch (e) { /* storage blocked: fall back to memory */ }
    if (!mem) mem = clone(window.SEED);
    TABLES.forEach((t) => { if (!Array.isArray(mem[t])) mem[t] = []; });
    if (!mem.settings) mem.settings = {};
    return mem;
  }
  function persist() {
    try { localStorage.setItem(DB_KEY, JSON.stringify(mem)); }
    catch (e) { throw new Error("This browser's storage is full. Use smaller images, or connect Supabase to go live."); }
  }

  /* ---------- helpers ---------- */
  function mergeSettings(saved) {
    const base = clone(window.SEED.settings);
    const out = Object.assign(base, saved || {});
    // keep exactly five story chapters
    const ch = Array.isArray(out.chapters) ? out.chapters : [];
    out.chapters = window.SEED.settings.chapters.map((d, i) => Object.assign({}, d, ch[i] || {}));
    if (!Array.isArray(out.occasions) || !out.occasions.length) out.occasions = clone(window.SEED.settings.occasions);
    return out;
  }
  function sortRows(table, rows) {
    if (table === "offers" || table === "services") return rows.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    return rows.sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
  }
  function check(res) {
    if (res.error) throw new Error(res.error.message || "Something went wrong talking to the database.");
    return res.data;
  }

  /* ---------- image helpers ---------- */
  function shrink(file, maxSide, quality) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const s = Math.min(1, maxSide / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        c.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not read that image."))), "image/jpeg", quality);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("That file isn't an image the browser can read.")); };
      img.src = url;
    });
  }
  const blobToDataURL = (b) => new Promise((r) => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(b); });

  /* ---------- public API ---------- */
  const Store = {
    mode: LIVE ? "live" : "demo",

    async settings() {
      if (!LIVE) return mergeSettings(db().settings);
      const data = check(await sb.from("settings").select("data").eq("id", 1).maybeSingle());
      return mergeSettings(data && data.data);
    },
    async saveSettings(s) {
      if (!LIVE) { db().settings = clone(s); persist(); return; }
      check(await sb.from("settings").upsert({ id: 1, data: s, updated_at: now() }));
    },

    /* opts: { kind, publishedOnly, activeOnly } */
    async list(table, opts = {}) {
      let rows;
      if (!LIVE) rows = clone(db()[table] || []);
      else rows = check(await sb.from(table).select("*")) || [];
      if (opts.kind) rows = rows.filter((r) => r.kind === opts.kind);
      if (opts.publishedOnly) rows = rows.filter((r) => r.published !== false);
      if (opts.activeOnly) rows = rows.filter((r) => r.active !== false);
      return sortRows(table, rows);
    },
    async getPost(slug) {
      const all = await this.list("posts", { publishedOnly: !(await this.isAdmin()) });
      return all.find((p) => p.slug === slug || p.id === slug) || null;
    },
    async save(table, row) {
      const r = clone(row);
      if (!r.id) r.id = uid();
      if (!r.created_at) r.created_at = now();
      if (!LIVE) {
        const list = db()[table];
        const i = list.findIndex((x) => x.id === r.id);
        if (i >= 0) list[i] = r; else list.push(r);
        persist(); return r;
      }
      return check(await sb.from(table).upsert(r).select().single());
    },
    async remove(table, id) {
      if (!LIVE) { db()[table] = db()[table].filter((x) => x.id !== id); persist(); return; }
      check(await sb.from(table).delete().eq("id", id));
    },

    /* public booking request (anyone can submit; only admin can read) */
    async addBooking(b) {
      const row = Object.assign({ id: uid(), created_at: now(), status: "new" }, b);
      if (!LIVE) { db().bookings.push(row); persist(); return row; }
      check(await sb.from("bookings").insert(row));
      return row;
    },

    async uploadImage(file) {
      if (!LIVE) {
        const blob = await shrink(file, 1000, 0.78);
        return blobToDataURL(blob);
      }
      const blob = await shrink(file, 1800, 0.85);
      const path = new Date().toISOString().slice(0, 10) + "/" + uid() + ".jpg";
      check(await sb.storage.from("media").upload(path, blob, { contentType: "image/jpeg", upsert: false }));
      return sb.storage.from("media").getPublicUrl(path).data.publicUrl;
    },

    /* ---------- auth ---------- */
    async signIn(email, password) {
      if (!LIVE) {
        if (password !== "demo") throw new Error("In demo mode the password is: demo");
        try { sessionStorage.setItem(AUTH_KEY, "1"); } catch (e) {}
        Store._demoAuthed = true; return;
      }
      check(await sb.auth.signInWithPassword({ email, password }));
    },
    async signOut() {
      if (!LIVE) { try { sessionStorage.removeItem(AUTH_KEY); } catch (e) {} Store._demoAuthed = false; return; }
      await sb.auth.signOut();
    },
    async isAdmin() {
      if (!LIVE) { try { return Store._demoAuthed || sessionStorage.getItem(AUTH_KEY) === "1"; } catch (e) { return !!Store._demoAuthed; } }
      const { data } = await sb.auth.getSession();
      return !!(data && data.session);
    },

    /* ---------- utilities for admin ---------- */
    async importStarter() {
      for (const t of ["posts", "offers", "services"]) {
        for (const row of window.SEED[t]) await this.save(t, row);
      }
    },
    resetDemo() { if (LIVE) return; mem = clone(window.SEED); persist(); }
  };

  window.Store = Store;
})();

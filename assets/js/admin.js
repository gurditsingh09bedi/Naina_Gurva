(function () {
  const S = window.Store;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const slugify = (t) => String(t || "").toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").slice(0, 70);
  const fmt = (iso) => { const d = new Date(iso); return isNaN(d) ? "" : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); };
  const md = (t) => (window.marked && window.DOMPurify ? DOMPurify.sanitize(marked.parse(String(t || ""))) : (window.UI ? UI.miniMd(String(t || "")) : esc(t)));

  let tab = "bookings", settings = null, editing = null;

  /* ---------- field definitions ---------- */
  const POST_FIELDS = [
    { k: "title", label: "Title", type: "text", req: true },
    { k: "slug", label: "Web address (auto from title)", type: "slug" },
    { k: "excerpt", label: "Short summary (shown on cards)", type: "textarea", rows: 2 },
    { k: "cover", label: "Cover photo", type: "image" },
    { k: "images", label: "More photos", type: "images" },
    { k: "body", label: "Full text", type: "markdown", help: "Formatting: ## Heading, **bold**, - bullet list. Use Preview to check." },
    { k: "tags", label: "Tags (comma separated)", type: "tags" },
    { k: "created_at", label: "Post date", type: "date" },
    { k: "published", label: "Published (visible on the website)", type: "toggle", def: true }
  ];
  const DEFS = {
    portfolio: { table: "posts", kind: "portfolio", title: "Portfolio", sub: "Looks shown in “The Work”. Click a look on the website to see its photos.", noun: "look", fields: POST_FIELDS },
    blog: { table: "posts", kind: "blog", title: "Journal", sub: "Blog posts with tips and stories.", noun: "post", fields: POST_FIELDS },
    offers: { table: "offers", title: "Offers", sub: "Deals shown in “Current Offers”. Turn one off to hide it without deleting.", noun: "offer", fields: [
      { k: "title", label: "Offer title", type: "text", req: true },
      { k: "description", label: "Description", type: "textarea", rows: 3 },
      { k: "badge", label: "Badge (e.g. Bridal, Festive)", type: "text" },
      { k: "price", label: "Price or deal (e.g. £60, 15% off)", type: "text" },
      { k: "was_price", label: "Old price (shown crossed out, optional)", type: "text" },
      { k: "valid_until", label: "Valid until (optional)", type: "date" },
      { k: "sort", label: "Order (1 = first)", type: "number" },
      { k: "active", label: "Show on website", type: "toggle", def: true }
    ] },
    services: { table: "services", title: "Services", sub: "Your service list and starting prices.", noun: "service", fields: [
      { k: "title", label: "Service name", type: "text", req: true },
      { k: "description", label: "Description", type: "textarea", rows: 3 },
      { k: "price", label: "Price (e.g. from £150)", type: "text" },
      { k: "duration", label: "Duration (e.g. 1.5 hrs)", type: "text" },
      { k: "sort", label: "Order (1 = first)", type: "number" }
    ] }
  };
  const SETTINGS_GROUPS = [
    { title: "Brand", fields: [
      { k: "brand_name", label: "Studio / artist name", type: "text" },
      { k: "brand_suffix", label: "Line next to the name", type: "text" },
      { k: "footer_note", label: "Footer line", type: "text" } ] },
    { title: "Opening screen", fields: [
      { k: "hero_kicker", label: "Small line above the name", type: "text" },
      { k: "hero_title", label: "Headline", type: "text" },
      { k: "hero_sub", label: "Intro text", type: "textarea", rows: 3 },
      { k: "hero_video", label: "Opening video link (optional, .mp4). Leave empty to use the built-in clip", type: "text" } ] },
    { title: "The Ritual (scroll film)", fields: [
      { k: "story_title", label: "Film title", type: "text" },
      { k: "chapters", label: "Five scenes", type: "chapters" } ] },
    { title: "About", fields: [
      { k: "about_kicker", label: "Small line", type: "text" },
      { k: "about_title", label: "Heading", type: "text" },
      { k: "about_text", label: "About text", type: "markdown" },
      { k: "about_image", label: "About photo", type: "image" } ] },
    { title: "Section headings", fields: [
      { k: "services_title", label: "Services", type: "text" },
      { k: "work_title", label: "Portfolio", type: "text" },
      { k: "offers_title", label: "Offers", type: "text" },
      { k: "journal_title", label: "Journal", type: "text" } ] },
    { title: "Booking", fields: [
      { k: "booking_title", label: "Heading", type: "text" },
      { k: "booking_note", label: "Note above the form", type: "textarea", rows: 2 },
      { k: "occasions", label: "Occasions in the dropdown (one per line)", type: "lines" } ] },
    { title: "Contact", fields: [
      { k: "whatsapp", label: "WhatsApp number (with country code, e.g. +44 7…)", type: "text" },
      { k: "phone", label: "Phone", type: "text" },
      { k: "email", label: "Email", type: "text" },
      { k: "instagram", label: "Instagram handle", type: "text" },
      { k: "area", label: "Area you cover", type: "text" } ] }
  ];

  /* ---------- ui helpers ---------- */
  let toastT;
  function toast(msg, bad) { const t = $("#toast"); t.textContent = msg; t.className = "toast" + (bad ? " bad" : ""); t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), 3200); }
  function armDelete(btn, onConfirm) {
    if (btn.dataset.armed) { onConfirm(); return; }
    btn.dataset.armed = "1"; const old = btn.textContent; btn.textContent = "Click again to delete"; btn.classList.add("danger");
    setTimeout(() => { delete btn.dataset.armed; btn.textContent = old; btn.classList.remove("danger"); }, 3500);
  }

  /* ---------- field rendering ---------- */
  function fieldHTML(f, v, prefix = "f") {
    const id = prefix + "-" + f.k;
    const lab = `<span class="fl">${esc(f.label)}</span>`;
    switch (f.type) {
      case "textarea": return `<label class="f">${lab}<textarea id="${id}" data-k="${f.k}" rows="${f.rows || 3}">${esc(v)}</textarea></label>`;
      case "markdown": return `<div class="f">${lab}<div class="mdbox"><div class="mdtabs"><button type="button" class="on" data-md="write">Write</button><button type="button" data-md="preview">Preview</button></div><textarea id="${id}" data-k="${f.k}" rows="12" class="mdin">${esc(v)}</textarea><div class="mdprev" hidden></div></div>${f.help ? `<small class="help">${esc(f.help)}</small>` : ""}</div>`;
      case "number": return `<label class="f">${lab}<input id="${id}" data-k="${f.k}" type="number" value="${esc(v)}"></label>`;
      case "date": return `<label class="f">${lab}<input id="${id}" data-k="${f.k}" type="date" value="${esc(String(v || "").slice(0, 10))}"></label>`;
      case "toggle": return `<label class="f tog"><input id="${id}" data-k="${f.k}" type="checkbox" ${v === false || (v == null && f.def === false) ? "" : "checked"}><i></i><span>${esc(f.label)}</span></label>`;
      case "tags": return `<label class="f">${lab}<input id="${id}" data-k="${f.k}" value="${esc((v || []).join(", "))}"></label>`;
      case "lines": return `<label class="f">${lab}<textarea id="${id}" data-k="${f.k}" rows="5">${esc((v || []).join("\n"))}</textarea></label>`;
      case "image": return `<div class="f img1" data-k="${f.k}" data-type="image">${lab}<div class="imgrow"><div class="thumb">${v ? `<img src="${esc(v)}" alt="">` : "<span>No photo</span>"}</div><div class="imgctl"><label class="b b-ghost b-sm up">Upload photo<input type="file" accept="image/*" hidden></label><input class="url" id="${id}" placeholder="or paste an image link" value="${esc(v && !String(v).startsWith("data:") ? v : "")}"><button type="button" class="b b-ghost b-sm rm">Remove</button></div></div><input type="hidden" class="val" value="${esc(v || "")}"></div>`;
      case "images": return `<div class="f imgs" data-k="${f.k}" data-type="images">${lab}<div class="gal">${(v || []).map((u) => galItem(u)).join("")}<label class="gal-add">+ Add photos<input type="file" accept="image/*" multiple hidden></label></div><small class="help">The first photo opens first. Drag isn't needed: remove and re-add to change order.</small></div>`;
      case "chapters": return `<div class="f" data-k="chapters" data-type="chapters">${lab}${(v || []).map((c, i) => `<fieldset class="chap"><legend>Scene ${i + 1}</legend><label class="f"><span class="fl">Title</span><input data-c="title" value="${esc(c.title)}"></label><label class="f"><span class="fl">Small note (shown on the photo)</span><input data-c="note" value="${esc(c.note)}"></label><label class="f"><span class="fl">Text</span><textarea data-c="text" rows="2">${esc(c.text)}</textarea></label></fieldset>`).join("")}<small class="help">Each scene plays over its own film clip as visitors scroll. The small note becomes the tags under the text (separate with ·).</small></div>`;
      case "slug": return `<label class="f">${lab}<input id="${id}" data-k="${f.k}" value="${esc(v)}" placeholder="filled in from the title"></label>`;
      default: return `<label class="f">${lab}<input id="${id}" data-k="${f.k}" value="${esc(v)}" ${f.req ? "required" : ""}></label>`;
    }
  }
  const galItem = (u) => `<div class="gi" data-url="${esc(u)}"><img src="${esc(u)}" alt=""><button type="button" aria-label="Remove photo">×</button></div>`;

  function wireFields(root) {
    $$(".mdbox", root).forEach((box) => {
      const ta = $("textarea", box), pv = $(".mdprev", box);
      $$("[data-md]", box).forEach((b) => b.addEventListener("click", () => {
        $$("[data-md]", box).forEach((x) => x.classList.toggle("on", x === b));
        const prev = b.dataset.md === "preview"; pv.hidden = !prev; ta.hidden = prev; if (prev) pv.innerHTML = md(ta.value);
      }));
    });
    $$(".img1", root).forEach((w) => {
      const val = $(".val", w), th = $(".thumb", w), url = $(".url", w);
      const set = (u) => { val.value = u || ""; th.innerHTML = u ? `<img src="${esc(u)}" alt="">` : "<span>No photo</span>"; };
      $("input[type=file]", w).addEventListener("change", async (e) => {
        const file = e.target.files[0]; if (!file) return;
        th.innerHTML = "<span>Uploading…</span>";
        try { const u = await S.uploadImage(file); set(u); url.value = u.startsWith("data:") ? "" : u; } catch (err) { set(val.value); toast(err.message, true); }
        e.target.value = "";
      });
      url.addEventListener("change", () => set(url.value.trim()));
      $(".rm", w).addEventListener("click", () => { set(""); url.value = ""; });
    });
    $$(".imgs", root).forEach((w) => {
      const gal = $(".gal", w), add = $(".gal-add", w);
      gal.addEventListener("click", (e) => { if (e.target.matches(".gi button")) e.target.parentElement.remove(); });
      $("input[type=file]", w).addEventListener("change", async (e) => {
        const files = Array.from(e.target.files);
        for (const file of files) {
          const ph = document.createElement("div"); ph.className = "gi loading"; ph.textContent = "Uploading…"; gal.insertBefore(ph, add);
          try { const u = await S.uploadImage(file); ph.outerHTML = galItem(u); } catch (err) { ph.remove(); toast(err.message, true); }
        }
        e.target.value = "";
      });
    });
    const title = $('[data-k="title"]', root), slug = $('[data-k="slug"]', root);
    if (title && slug) {
      let manual = !!slug.value;
      slug.addEventListener("input", () => (manual = !!slug.value));
      title.addEventListener("input", () => { if (!manual) slug.value = slugify(title.value); });
    }
  }

  function readFields(root, fields, base) {
    const out = Object.assign({}, base);
    fields.forEach((f) => {
      if (f.type === "image") { out[f.k] = $(`.img1[data-k="${f.k}"] .val`, root).value.trim(); return; }
      if (f.type === "images") { out[f.k] = $$(`.imgs[data-k="${f.k}"] .gi[data-url]`, root).map((g) => g.dataset.url); return; }
      if (f.type === "chapters") { out.chapters = $$(".chap", root).map((fs) => ({ title: $('[data-c="title"]', fs).value.trim(), note: $('[data-c="note"]', fs).value.trim(), text: $('[data-c="text"]', fs).value.trim() })); return; }
      const el = $(`[data-k="${f.k}"]`, root); if (!el) return;
      if (f.type === "toggle") out[f.k] = el.checked;
      else if (f.type === "number") out[f.k] = el.value === "" ? null : Number(el.value);
      else if (f.type === "tags") out[f.k] = el.value.split(",").map((s) => s.trim()).filter(Boolean);
      else if (f.type === "lines") out[f.k] = el.value.split("\n").map((s) => s.trim()).filter(Boolean);
      else if (f.type === "date") out[f.k] = el.value ? (f.k === "created_at" ? new Date(el.value + "T12:00:00").toISOString() : el.value) : (f.k === "created_at" ? base.created_at || new Date().toISOString() : "");
      else out[f.k] = el.value.trim();
    });
    return out;
  }

  /* ---------- editor drawer ---------- */
  function openEditor(defKey, row) {
    const def = DEFS[defKey];
    editing = { defKey, row: row || {} };
    $("#edTitle").textContent = (row ? "Edit " : "New ") + def.noun;
    const r = row || { kind: def.kind, published: true, active: true, created_at: new Date().toISOString() };
    $("#edBody").innerHTML = def.fields.map((f) => fieldHTML(f, r[f.k] != null ? r[f.k] : (f.type === "toggle" ? f.def : ""))).join("");
    $("#edErr").textContent = "";
    wireFields($("#edBody"));
    $("#drawerBg").hidden = false; document.body.classList.add("lock");
    setTimeout(() => { const t = $('[data-k="title"]', $("#edBody")); t && t.focus(); }, 50);
  }
  function closeEditor() { $("#drawerBg").hidden = true; document.body.classList.remove("lock"); editing = null; }

  $("#editor").addEventListener("submit", async (e) => {
    e.preventDefault(); if (!editing) return;
    const def = DEFS[editing.defKey];
    const row = readFields($("#edBody"), def.fields, editing.row);
    if (def.kind) row.kind = def.kind;
    if (!row.title) { $("#edErr").textContent = "Add a title first."; return; }
    if (def.table === "posts") {
      row.slug = slugify(row.slug || row.title);
      const all = await S.list("posts");
      if (all.some((p) => p.slug === row.slug && p.id !== row.id)) row.slug += "-" + Math.random().toString(36).slice(2, 5);
      if (!row.cover && row.images && row.images.length) row.cover = row.images[0];
    }
    const btn = $("#edSave"); btn.disabled = true; btn.textContent = "Saving…";
    try { await S.save(def.table, row); closeEditor(); toast("Saved"); render(); }
    catch (err) { $("#edErr").textContent = err.message; }
    finally { btn.disabled = false; btn.textContent = "Save"; }
  });
  $("#edClose").addEventListener("click", closeEditor);
  $("#edCancel").addEventListener("click", closeEditor);
  addEventListener("keydown", (e) => { if (e.key === "Escape" && editing) closeEditor(); });

  /* ---------- views ---------- */
  async function render() {
    $$("#tabs button").forEach((b) => b.classList.toggle("on", b.dataset.tab === tab));
    const view = $("#view"); const add = $("#addBtn");
    if (tab === "bookings") return renderBookings(view, add);
    if (tab === "settings") return renderSettings(view, add);
    const def = DEFS[tab];
    $("#viewTitle").textContent = def.title; $("#viewSub").textContent = def.sub;
    add.hidden = false; add.textContent = "+ Add " + def.noun; add.onclick = () => openEditor(tab);
    view.innerHTML = `<p class="loading">Loading…</p>`;
    const rows = await S.list(def.table, def.kind ? { kind: def.kind } : {});
    if (!rows.length) { view.innerHTML = `<div class="empty"><p>No ${def.noun}s yet.</p><button class="b b-gold" id="emptyAdd">+ Add your first ${def.noun}</button></div>`; $("#emptyAdd").onclick = () => openEditor(tab); return; }
    view.innerHTML = `<div class="cards">${rows.map((r) => {
      const img = r.cover || (r.images || [])[0];
      const on = def.table === "posts" ? r.published !== false : def.table === "offers" ? r.active !== false : true;
      const meta = def.table === "posts" ? fmt(r.created_at) + ((r.tags || []).length ? " · " + r.tags.join(", ") : "") : def.table === "offers" ? [r.badge, r.price].filter(Boolean).join(" · ") : [r.price, r.duration].filter(Boolean).join(" · ");
      return `<article class="card" data-id="${esc(r.id)}">
        ${def.table === "posts" ? `<div class="c-img">${img ? `<img src="${esc(img)}" alt="">` : ""}</div>` : ""}
        <div class="c-body"><div class="c-top"><h3>${esc(r.title)}</h3>${def.table !== "services" ? `<span class="pill ${on ? "pill-on" : ""}">${on ? (def.table === "posts" ? "Published" : "Showing") : (def.table === "posts" ? "Draft" : "Hidden")}</span>` : ""}</div>
        <p class="meta">${esc(meta)}</p><p class="ex">${esc(r.excerpt || r.description || "")}</p>
        <div class="c-act"><button class="b b-ghost b-sm" data-act="edit">Edit</button>${def.table !== "services" ? `<button class="b b-ghost b-sm" data-act="toggle">${on ? (def.table === "posts" ? "Unpublish" : "Hide") : (def.table === "posts" ? "Publish" : "Show")}</button>` : ""}${def.table === "posts" ? `<a class="b b-ghost b-sm" href="post.html#${esc(r.slug || r.id)}" target="_blank" rel="noopener">View</a>` : ""}<button class="b b-ghost b-sm" data-act="del">Delete</button></div></div>
      </article>`; }).join("")}</div>`;
    $$(".card", view).forEach((c) => {
      const row = rows.find((r) => r.id === c.dataset.id);
      $('[data-act="edit"]', c).onclick = () => openEditor(tab, row);
      const tg = $('[data-act="toggle"]', c);
      if (tg) tg.onclick = async () => { const k = def.table === "posts" ? "published" : "active"; row[k] = row[k] === false; try { await S.save(def.table, row); toast(row[k] ? "Now visible on the website" : "Hidden from the website"); render(); } catch (e) { toast(e.message, true); } };
      $('[data-act="del"]', c).onclick = (e) => armDelete(e.currentTarget, async () => { try { await S.remove(def.table, row.id); toast("Deleted"); render(); } catch (err) { toast(err.message, true); } });
    });
  }

  const STATUSES = [["new", "New"], ["confirmed", "Confirmed"], ["done", "Done"], ["cancelled", "Cancelled"]];
  async function renderBookings(view, add) {
    $("#viewTitle").textContent = "Bookings"; $("#viewSub").textContent = "Requests sent from the booking form. Change the status as you confirm them.";
    add.hidden = true;
    view.innerHTML = `<p class="loading">Loading…</p>`;
    let rows;
    try { rows = await S.list("bookings"); } catch (e) { view.innerHTML = `<p class="err">${esc(e.message)}</p>`; return; }
    const count = (s) => rows.filter((r) => (r.status || "new") === s).length;
    $("#newCount").textContent = count("new") || "";
    const upcoming = rows.filter((r) => r.event_date && r.event_date >= new Date().toISOString().slice(0, 10) && r.status !== "cancelled").length;
    view.innerHTML = `
      <div class="stats"><div><b>${count("new")}</b><span>New requests</span></div><div><b>${count("confirmed")}</b><span>Confirmed</span></div><div><b>${upcoming}</b><span>Upcoming events</span></div></div>
      ${rows.length ? `<div class="bk-list">${rows.map((r) => `
        <article class="bk st-${esc(r.status || "new")}" data-id="${esc(r.id)}">
          <div class="bk-date"><b>${esc(r.event_date ? new Date(r.event_date + "T12:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—")}</b><span>${esc(r.event_date ? r.event_date.slice(0, 4) : "")}</span></div>
          <div class="bk-main"><h3>${esc(r.name)} <small>${esc(r.occasion || "")}${r.faces > 1 ? " · " + esc(r.faces) + " faces" : ""}</small></h3>
            <p class="meta">${[r.ready_by && "Ready by " + r.ready_by, r.location, r.phone, r.email].filter(Boolean).map(esc).join(" · ")}</p>
            ${r.message ? `<p class="ex">${esc(r.message)}</p>` : ""}
            <p class="meta">Received ${esc(fmt(r.created_at))}</p></div>
          <div class="bk-act"><select aria-label="Status for ${esc(r.name)}">${STATUSES.map(([v, l]) => `<option value="${v}" ${(r.status || "new") === v ? "selected" : ""}>${l}</option>`).join("")}</select>
            ${r.phone ? `<a class="b b-ghost b-sm" href="https://wa.me/${esc(String(r.phone).replace(/[^\d]/g, "").replace(/^0/, "44"))}" target="_blank" rel="noopener">WhatsApp</a>` : ""}
            <button class="b b-ghost b-sm" data-act="del">Delete</button></div>
        </article>`).join("")}</div>` : `<div class="empty"><p>No booking requests yet. They'll appear here as soon as someone sends the form.</p></div>`}`;
    $$(".bk", view).forEach((el) => {
      const row = rows.find((r) => r.id === el.dataset.id);
      $("select", el).onchange = async (e) => { row.status = e.target.value; try { await S.save("bookings", row); toast("Status updated"); render(); } catch (err) { toast(err.message, true); } };
      $('[data-act="del"]', el).onclick = (e) => armDelete(e.currentTarget, async () => { try { await S.remove("bookings", row.id); toast("Booking deleted"); render(); } catch (err) { toast(err.message, true); } });
    });
  }

  async function renderSettings(view, add) {
    $("#viewTitle").textContent = "Website text & photos"; $("#viewSub").textContent = "Change the name, headlines, story scenes, photos and contact details.";
    add.hidden = true;
    settings = await S.settings();
    view.innerHTML = `<form id="setForm" class="setform" novalidate>${SETTINGS_GROUPS.map((g, gi) => `
      <details class="grp" ${gi < 2 ? "open" : ""}><summary>${esc(g.title)}</summary><div class="grp-body">${g.fields.map((f) => fieldHTML(f, settings[f.k], "s")).join("")}</div></details>`).join("")}
      <div class="sticky-save"><span class="err" id="setErr"></span><button class="b b-gold" type="submit" id="setSave">Save website changes</button></div></form>`;
    wireFields(view);
    $("#setForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const all = SETTINGS_GROUPS.flatMap((g) => g.fields);
      const next = readFields(view, all, settings);
      const btn = $("#setSave"); btn.disabled = true; btn.textContent = "Saving…";
      try { await S.saveSettings(next); settings = next; toast("Website updated"); $$(".bn").forEach((b) => (b.textContent = next.brand_name || "Studio")); }
      catch (err) { $("#setErr").textContent = err.message; }
      finally { btn.disabled = false; btn.textContent = "Save website changes"; }
    });
  }

  /* ---------- boot ---------- */
  $$("#tabs button").forEach((b) => b.addEventListener("click", () => { tab = b.dataset.tab; try { localStorage.setItem("mua_admin_tab", tab); } catch (e) {} render(); }));
  $("#signOut").onclick = async () => { await S.signOut(); location.reload(); };
  $("#resetDemo").onclick = (e) => armDelete(e.currentTarget, () => { S.resetDemo(); toast("Demo content restored"); render(); });
  $("#importStarter").onclick = async (e) => { const b = e.currentTarget; b.disabled = true; b.textContent = "Importing…"; try { await S.importStarter(); $("#importBanner").hidden = true; toast("Starter content imported"); render(); } catch (err) { toast(err.message, true); b.disabled = false; b.textContent = "Import starter content"; } };

  $("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault(); const btn = $("#lgBtn"); $("#lgErr").textContent = ""; btn.disabled = true; btn.textContent = "Signing in…";
    try { await S.signIn($("#lg-email").value.trim(), $("#lg-pass").value); start(); }
    catch (err) { $("#lgErr").textContent = err.message.includes("Invalid") ? "Email or password is wrong." : err.message; }
    finally { btn.disabled = false; btn.textContent = "Sign in"; }
  });

  async function start() {
    $("#login").hidden = true; $("#app").hidden = false;
    $("#modeBadge").textContent = S.mode === "live" ? "● Live" : "● Demo mode";
    $("#modeBadge").className = "mode " + S.mode;
    $("#demoBanner").hidden = S.mode !== "demo";
    try { tab = localStorage.getItem("mua_admin_tab") || "bookings"; } catch (e) {}
    try {
      const st = await S.settings(); $$(".bn").forEach((b) => (b.textContent = st.brand_name || "Studio"));
      if (S.mode === "live") { const p = await S.list("posts"); $("#importBanner").hidden = p.length > 0; }
    } catch (e) { toast(e.message, true); }
    render();
  }

  (async function boot() {
    $("#demoHint").hidden = S.mode !== "demo";
    if (S.mode === "demo") { $("#lg-email").value = "demo@studio.local"; }
    try { const st = await S.settings(); $$(".bn").forEach((b) => (b.textContent = st.brand_name || "Studio")); } catch (e) {}
    if (await S.isAdmin()) start(); else { $("#login").hidden = false; $("#lg-email").focus(); }
  })();
})();

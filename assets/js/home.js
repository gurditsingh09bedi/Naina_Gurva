(function () {
  const { $, $$, esc, md, applySettings, grain, timecode, navScroll, reduced } = window.UI;
  const S = window.Store;
  const R = window.RITUAL || { chapters: [] };
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const isDesk = () => innerWidth > 900;
  let settings, portfolio = [];

  /* =========================================================
     DATA
     ========================================================= */
  async function load() {
    try {
      settings = await S.settings();
      const r = await Promise.all([S.list("posts", { publishedOnly: true }), S.list("offers", { activeOnly: true }), S.list("services")]);
      return { posts: r[0], offers: r[1], services: r[2] };
    } catch (e) {
      console.error(e);
      settings = window.SEED.settings;
      return { posts: window.SEED.posts, offers: window.SEED.offers, services: window.SEED.services };
    }
  }

  /* =========================================================
     PRELOADER  (hero video + first scene of the film)
     ========================================================= */
  /* film frames are packed into sprite sheets: one sheet per scene, chosen for screen shape */
  const MOB = innerWidth <= 900;
  const SET = MOB ? R.mob : R.desk;
  (R.chapters || []).forEach((c) => { c.src = MOB ? c.m : c.d; c.count = R.count; });
  const sheets = (R.chapters || []).map(() => null);
  const pending = {};
  function loadImg(src) {
    return new Promise((res) => { const i = new Image(); i.decoding = "async"; i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
  }
  function loadChapter(ci, onEach) {
    const c = R.chapters[ci]; if (!c) return Promise.resolve();
    if (sheets[ci]) { onEach && onEach(); return Promise.resolve(); }
    if (!pending[ci]) pending[ci] = loadImg(c.src).then((img) => (sheets[ci] = img));
    return pending[ci].then(() => onEach && onEach());
  }
  function getFrame(ci, fi) {
    const img = sheets[ci]; if (!img) return null;
    fi = Math.max(0, Math.min(R.count - 1, fi));
    return { img, sx: (fi % R.cols) * SET.fw, sy: Math.floor(fi / R.cols) * SET.fh, sw: SET.fw, sh: SET.fh };
  }
  function preload() {
    return new Promise((done) => {
      const bar = $("#ldBar"), pct = $("#ldPct");
      const first = R.chapters && R.chapters[0] ? 1 : 0;
      const total = first + 1;
      let got = 0, finished = false;
      const tick = () => { got++; const p = Math.min(1, got / total); bar.style.transform = "scaleX(" + p + ")"; pct.textContent = Math.round(p * 100); if (got >= total) finish(); };
      const finish = () => { if (finished) return; finished = true; bar.style.transform = "scaleX(1)"; pct.textContent = "100"; setTimeout(done, 250); };
      const v = $("#heroVideo");
      if (v.readyState >= 3) tick(); else { v.addEventListener("canplay", tick, { once: true }); v.addEventListener("error", tick, { once: true }); }
      loadChapter(0, tick);
      setTimeout(finish, 3500); // never hold the page for long
    });
  }

  /* =========================================================
     HERO: split title, powder particles, timecode
     ========================================================= */
  function splitHero() {
    const h = $("#heroTitle"); const words = h.textContent.trim().split(/\s+/);
    const itFrom = Math.max(1, words.length - 2);
    h.innerHTML = words.map((w, i) => `<span class="w${i >= itFrom ? " it" : ""}"><span style="transition-delay:${0.55 + i * 0.09}s">${esc(w)}</span></span>`).join(" ");
    h.setAttribute("aria-label", words.join(" "));
  }

  function powder() {
    const cv = $("#powder"); if (!cv) return;
    const cx = cv.getContext("2d"); const dpr = Math.min(2, devicePixelRatio || 1);
    let W = 0, H = 0, P = [], visible = true, raf = 0, last = 0;
    const cols = [[243, 220, 170], [226, 161, 156], [216, 180, 123], [255, 240, 225]];
    const size = () => { const b = cv.getBoundingClientRect(); W = b.width; H = b.height; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const spawn = (x, y, n, spread, burst) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * 6.283, sp = (burst ? 2.5 : 0.5) * Math.random() * spread;
        P.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (burst ? 0.6 : 0.25), life: 1, decay: 0.004 + Math.random() * 0.012, r: 0.6 + Math.random() * (burst ? 3 : 2.2), c: cols[(Math.random() * cols.length) | 0] });
      }
      if (P.length > 900) P.splice(0, P.length - 900);
    };
    const hero = cv.parentElement;
    hero.addEventListener("pointermove", (e) => {
      const b = cv.getBoundingClientRect(); const now = performance.now();
      if (now - last > 16) { spawn(e.clientX - b.left, e.clientY - b.top, 4, 1.2, false); last = now; }
    });
    hero.addEventListener("pointerdown", (e) => { const b = cv.getBoundingClientRect(); spawn(e.clientX - b.left, e.clientY - b.top, 70, 2, true); });
    function draw() {
      cx.clearRect(0, 0, W, H);
      if (Math.random() < 0.5) spawn(Math.random() * W, H + 10, 1, 0.3, false); // ambient rising dust
      cx.globalCompositeOperation = "lighter";
      for (let i = P.length - 1; i >= 0; i--) {
        const p = P[i];
        p.x += p.vx; p.y += p.vy; p.vx *= 0.985; p.vy = p.vy * 0.985 - 0.006; p.life -= p.decay;
        if (p.life <= 0 || p.y < -20) { P.splice(i, 1); continue; }
        const r = p.r * (1.6 - p.life * 0.6), al = Math.min(1, p.life * 1.4) * 0.8;
        const g = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
        g.addColorStop(0, `rgba(${p.c[0]},${p.c[1]},${p.c[2]},${al})`); g.addColorStop(1, `rgba(${p.c[0]},${p.c[1]},${p.c[2]},0)`);
        cx.fillStyle = g; cx.beginPath(); cx.arc(p.x, p.y, r * 3, 0, 6.283); cx.fill();
      }
      cx.globalCompositeOperation = "source-over";
      if (visible) raf = requestAnimationFrame(draw);
    }
    size(); addEventListener("resize", size);
    new IntersectionObserver((es) => { visible = es[0].isIntersecting; cancelAnimationFrame(raf); if (visible && !reduced) draw(); }).observe(cv);
    if (!reduced) draw();
  }

  function heroTimecode() {
    const el = $("#heroTc"); if (!el || reduced) return;
    const t0 = performance.now();
    setInterval(() => { el.textContent = timecode((performance.now() - t0) / 1000); }, 1000 / 24);
  }

  /* =========================================================
     MARQUEE (speeds up with scroll)
     ========================================================= */
  function marquee(st, services) {
    const words = (st.occasions || []).concat(services.map((s) => s.title)).filter((v, i, a) => a.indexOf(v) === i);
    const html = (list) => list.concat(list).concat(list).map((w) => `<span>${esc(w)}<em>✦</em></span>`).join("");
    $("#mq1").innerHTML = html(words); $("#mq2").innerHTML = html(words.slice().reverse());
    if (reduced) return;
    let x1 = 0, x2 = 0, lastY = scrollY, boost = 0;
    const r1 = $("#mq1"), r2 = $("#mq2");
    (function step() {
      const dy = scrollY - lastY; lastY = scrollY; boost = boost * 0.9 + Math.abs(dy) * 0.08;
      const sp = 0.6 + boost;
      const w1 = r1.scrollWidth / 3, w2 = r2.scrollWidth / 3;
      x1 = (x1 - sp) % w1; x2 = (x2 + sp) % w2;
      r1.style.transform = `translate3d(${x1}px,0,0) skewX(${-Math.min(12, boost * 2)}deg)`;
      r2.style.transform = `translate3d(${x2 - w2}px,0,0) skewX(${Math.min(12, boost * 2)}deg)`;
      requestAnimationFrame(step);
    })();
  }

  /* =========================================================
     THE RITUAL: scroll-scrubbed film with brush-stroke wipes
     ========================================================= */
  function ritual(st) {
    const sec = $("#story"), cv = $("#rCanvas"), cx = cv.getContext("2d");
    const N = (R.chapters || []).length;
    const chapters = st.chapters.slice(0, Math.max(N, 1));
    const dpr = Math.min(1.5, devicePixelRatio || 1);
    let W = 0, H = 0, cur = -1, lastKey = "";

    $("#rRail").innerHTML = chapters.map((c, i) => `<li><span>${esc(c.title)}</span><i></i></li>`).join("");
    $("#rSr").innerHTML = chapters.map((c) => `<li><b>${esc(c.title)}</b>: ${esc(c.text)}</li>`).join("");
    const rail = $$("#rRail li");

    function size() { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); lastKey = ""; render(); }
    function cover(fr, zoom, ci) {
      const s = Math.max(W / fr.sw, H / fr.sh) * zoom;
      const w = fr.sw * s, h = fr.sh * s;
      const x = (W - w) / 2, y = (H - h) / 2;
      cx.drawImage(fr.img, fr.sx, fr.sy, fr.sw, fr.sh, x, y, w, h);
    }
    function brushPath(edge, t) {
      // wavy, paint-stroke edge moving left -> right
      cx.beginPath(); cx.moveTo(-10, -10);
      const steps = 24;
      for (let i = 0; i <= steps; i++) {
        const y = (H + 20) * (i / steps) - 10;
        const wob = Math.sin(i * 1.7 + t * 9) * 26 + Math.sin(i * 0.6 + 2) * 40;
        cx.lineTo(edge + wob, y);
      }
      cx.lineTo(-10, H + 10); cx.closePath();
    }
    function progress() {
      const r = sec.getBoundingClientRect();
      const total = sec.offsetHeight - innerHeight;
      return Math.max(0, Math.min(0.99999, -r.top / Math.max(1, total)));
    }
    function setChapter(i) {
      if (i === cur) return; cur = i;
      const c = chapters[i] || {};
      const copy = $(".r-copy"); copy.classList.add("swap");
      const t = $("#rTitle"); t.classList.remove("on");
      t.innerHTML = Array.from(c.title || "").map((ch, k) => `<span class="lt" style="transition-delay:${k * 0.035}s">${ch === " " ? "&nbsp;" : esc(ch)}</span>`).join("");
      t.setAttribute("aria-label", c.title || "");
      setTimeout(() => {
        $("#rText").textContent = c.text || "";
        $("#rChips").innerHTML = String(c.note || "").split("·").map((s) => s.trim()).filter(Boolean).map((s) => `<li>${esc(s)}</li>`).join("");
        copy.classList.remove("swap"); t.classList.add("on");
      }, 220);
      $("#rNum").textContent = String(i + 1).padStart(2, "0");
      $("#rScene").textContent = "Scene " + String(i + 1).padStart(2, "0");
      rail.forEach((li, k) => { li.classList.toggle("on", k === i); li.classList.toggle("done", k < i); });
      // load this and the next chapter's frames if not yet loaded
      loadChapter(i, () => (lastKey = "")); if (i + 1 < N) loadChapter(i + 1);
    }
    function render() {
      if (!N) return;
      const p = progress();
      const seg = p * N, ci = Math.min(N - 1, Math.floor(seg)), t = seg - ci;
      const cnt = R.count;
      const fi = Math.round(t * (cnt - 1));
      const WIPE = 0.16;
      const zoom = 1.04 + t * 0.06; // slow push-in through each scene
      const key = ci + ":" + fi + ":" + Math.round(zoom * 400) + ":" + (t < WIPE && ci > 0 ? Math.round(t * 400) : "");
      setChapter(ci);
      $("#rTc").textContent = timecode(p * 120);
      $("#rHint").style.opacity = p > 0.03 ? 0 : 1;
      if (key === lastKey) return; lastKey = key;
      const img = getFrame(ci, fi);
      cx.fillStyle = "#000"; cx.fillRect(0, 0, W, H);
      if (t < WIPE && ci > 0) {
        // previous scene's last frame underneath, new scene painted on with a brush stroke
        const prev = getFrame(ci - 1, R.chapters[ci - 1].count - 1);
        if (prev) cover(prev, 1.1, ci - 1);
        const k = t / WIPE, e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        const edge = -120 + e * (W + 280);
        cx.save(); brushPath(edge, k); cx.clip(); if (img) cover(img, zoom, ci); cx.restore();
        // gold light along the stroke edge
        const g = cx.createLinearGradient(edge - 90, 0, edge + 60, 0);
        g.addColorStop(0, "rgba(243,220,170,0)"); g.addColorStop(0.7, "rgba(243,220,170,.55)"); g.addColorStop(1, "rgba(243,220,170,0)");
        cx.globalCompositeOperation = "screen"; cx.fillStyle = g; cx.fillRect(edge - 90, 0, 150, H); cx.globalCompositeOperation = "source-over";
      } else if (img) cover(img, zoom, ci);
      // gentle fade-out at the very end into the lookbook
      if (ci === N - 1 && t > 0.85) { cx.fillStyle = `rgba(16,10,14,${(t - 0.85) / 0.15})`; cx.fillRect(0, 0, W, H); }
    }
    let ticking = false;
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; render(); }); } };
    addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", size);
    size(); setChapter(0);
    // keep loading the rest of the film in the background
    (async () => { for (let i = 1; i < N; i++) await loadChapter(i, () => (lastKey = "")); render(); })();
    // redraw as first frames arrive
    const iv = setInterval(() => { lastKey = ""; render(); if (sheets[0]) clearInterval(iv); }, 300);
  }

  /* =========================================================
     LOOKBOOK: horizontal scroll through her work
     ========================================================= */
  function lookbook(list) {
    const track = $("#lkTrack"), sec = $("#lookbook");
    track.innerHTML = list.map((p, i) => `
      <button class="lk-card" data-id="${esc(p.id)}" data-cursor="View" aria-label="Open ${esc(p.title)}">
        <span class="lk-idx">${String(i + 1).padStart(2, "0")}</span>
        <img src="${esc(p.cover || (p.images || [])[0] || "")}" alt="${esc(p.title)}" loading="lazy">
        <span class="lk-cap"><small>${esc((p.tags || []).join(" · "))}</small><b>${esc(p.title)}</b></span>
      </button>`).join("") + `
      <div class="lk-end"><h3>Your story could be next.</h3><p>Bridal trials, festive looks and party glam, booked around your date.</p><a class="btn btn-gold" href="#book" data-cursor="Book">Book your look</a></div>`;
    $("#lkAll").textContent = String(list.length).padStart(2, "0");
    $$(".lk-card", track).forEach((b) => b.addEventListener("click", () => openLb(b.dataset.id)));
    const cards = $$(".lk-card", track);
    function layout() {
      if (!isDesk() || reduced) { sec.style.height = ""; return; }
      const dist = Math.max(0, track.scrollWidth - innerWidth);
      sec.style.height = innerHeight + dist + "px";
      update();
    }
    function update() {
      if (!isDesk() || reduced) return;
      const r = sec.getBoundingClientRect();
      const dist = Math.max(0, track.scrollWidth - innerWidth);
      const p = Math.max(0, Math.min(1, -r.top / Math.max(1, sec.offsetHeight - innerHeight)));
      track.style.transform = `translate3d(${-p * dist}px,0,0)`;
      $("#lkBar").style.transform = `scaleX(${p})`;
      const idx = Math.min(list.length, Math.floor(p * list.length) + 1);
      $("#lkNow").textContent = String(idx).padStart(2, "0");
      cards.forEach((c) => { const b = c.getBoundingClientRect(); const mid = (b.left + b.width / 2) / innerWidth - 0.5; const img = c.querySelector("img"); img.style.transform = `scale(1.15) translateX(${mid * -8}%)`; });
    }
    addEventListener("resize", layout); addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
    $$("img", track).forEach((i) => i.addEventListener("load", layout));
    layout();
  }

  /* =========================================================
     CURSOR
     ========================================================= */
  function cursor() {
    if (!fine || reduced) return;
    const c = $("#cur"), dot = $(".cur-dot", c), ring = $(".cur-ring", c), lab = $("#curLabel");
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px)`; });
    (function loop() { rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16; ring.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(loop); })();
    document.addEventListener("pointerover", (e) => {
      const t = e.target.closest("[data-cursor], .tile, .jcard, .offer .btn");
      if (t) { lab.textContent = t.dataset.cursor || (t.classList.contains("jcard") ? "Read" : "Open"); c.classList.add("big"); }
    });
    document.addEventListener("pointerout", (e) => { const t = e.target.closest("[data-cursor], .tile, .jcard, .offer .btn"); if (t && !t.contains(e.relatedTarget)) c.classList.remove("big"); });
  }

  /* =========================================================
     SECTIONS (services, offers, journal, booking, contact)
     ========================================================= */
  function renderServices(list) {
    $("#servicesList").innerHTML = list.map((s, i) => `
      <article class="svc"><span class="svc-n">${String(i + 1).padStart(2, "0")}</span>
        <div class="svc-main"><h3>${esc(s.title)}</h3><p>${esc(s.description)}</p></div>
        <div class="svc-meta"><b>${esc(s.price)}</b>${s.duration ? `<span>${esc(s.duration)}</span>` : ""}</div></article>`).join("") || `<p class="muted">Services will appear here.</p>`;
  }
  function renderOffers(list) {
    $("#offersList").innerHTML = list.map((o) => `
      <article class="offer">${o.badge ? `<span class="badge">${esc(o.badge)}</span>` : ""}
        <h3>${esc(o.title)}</h3><p>${esc(o.description)}</p>
        <div class="offer-foot"><span class="price">${esc(o.price)}${o.was_price ? ` <s>${esc(o.was_price)}</s>` : ""}</span>${o.valid_until ? `<span class="muted small">Until ${esc(UI.fmtDate(o.valid_until))}</span>` : ""}</div>
        <a class="btn btn-ghost btn-sm" href="#book" data-offer="${esc(o.title)}" data-cursor="Claim">Claim offer</a></article>`).join("") || `<p class="muted">No offers running right now.</p>`;
    $$("[data-offer]").forEach((a) => a.addEventListener("click", () => { $("#bk-msg").value = "Offer: " + a.dataset.offer + "\n" + $("#bk-msg").value.replace(/^Offer:.*\n?/, ""); }));
    if (fine && !reduced) $$(".offer").forEach((card) => {
      card.addEventListener("pointermove", (e) => { const b = card.getBoundingClientRect(); const x = (e.clientX - b.left) / b.width - 0.5, y = (e.clientY - b.top) / b.height - 0.5; card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`; });
      card.addEventListener("pointerleave", () => (card.style.transform = ""));
    });
  }
  function renderJournal(list) {
    $("#journalList").innerHTML = list.map((p, i) => `
      <a class="jcard ${i === 0 ? "feature" : ""}" href="post.html#${encodeURIComponent(p.slug || p.id)}">
        <div class="jimg"><img src="${esc(p.cover || "")}" alt="" loading="lazy"></div>
        <div class="jbody"><small>${esc(UI.fmtDate(p.created_at))}${(p.tags || []).length ? " · " + esc(p.tags[0]) : ""}</small>
        <h3>${esc(p.title)}</h3><p>${esc(p.excerpt)}</p><span class="more">Read</span></div></a>`).join("") || `<p class="muted">The first journal post is on its way.</p>`;
  }
  function renderContact(st) {
    const items = [];
    if (st.whatsapp) items.push(`<li><span>WhatsApp</span><a href="https://wa.me/${esc(st.whatsapp.replace(/[^\d]/g, ""))}" target="_blank" rel="noopener">${esc(st.whatsapp)}</a></li>`);
    if (st.phone) items.push(`<li><span>Phone</span><b>${esc(st.phone)}</b></li>`);
    if (st.email) items.push(`<li><span>Email</span><b>${esc(st.email)}</b></li>`);
    if (st.instagram) { const h = st.instagram.replace(/^@/, ""); items.push(`<li><span>Instagram</span><a href="https://instagram.com/${esc(h)}" target="_blank" rel="noopener">@${esc(h)}</a></li>`); }
    if (st.area) items.push(`<li><span>Area</span><b>${esc(st.area)}</b></li>`);
    $("#contactList").innerHTML = items.join("");
  }
  function setupBooking(st) {
    $("#bk-occasion").innerHTML = st.occasions.map((o) => `<option>${esc(o)}</option>`).join("");
    $("#bk-date").min = new Date().toISOString().slice(0, 10);
    $("#bookForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = e.target, msg = $("#bkMsg"), btn = $("#bkSubmit");
      const data = Object.fromEntries(new FormData(f).entries());
      if (!data.name.trim() || !data.phone.trim() || !data.event_date) { msg.className = "form-msg err"; msg.textContent = "Please add your name, a phone number and the event date."; return; }
      data.faces = parseInt(data.faces || "1", 10) || 1;
      btn.disabled = true; btn.textContent = "Sending…";
      try {
        await S.addBooking(data); f.reset(); $("#bk-faces").value = 1;
        msg.className = "form-msg ok"; msg.textContent = "Request received. You'll get a reply to confirm your date" + (st.whatsapp ? " on WhatsApp." : ".");
      } catch (err) { msg.className = "form-msg err"; msg.textContent = "Couldn't send your request: " + err.message; }
      finally { btn.disabled = false; btn.textContent = "Send booking request"; }
    });
  }

  /* lightbox */
  function openLb(id) {
    const p = portfolio.find((x) => x.id === id); if (!p) return;
    const imgs = (p.images && p.images.length ? p.images : [p.cover]).filter(Boolean);
    $("#lbMedia").innerHTML = imgs.map((u) => `<img src="${esc(u)}" alt="${esc(p.title)}">`).join("");
    $("#lbTitle").textContent = p.title; $("#lbText").textContent = p.excerpt || "";
    $("#lbTags").textContent = (p.tags || []).join(" · ");
    $("#lbLink").href = "post.html#" + encodeURIComponent(p.slug || p.id);
    $("#lb").hidden = false; document.body.classList.add("lock"); $("#lbClose").focus();
  }
  function closeLb() { $("#lb").hidden = true; document.body.classList.remove("lock"); }

  function reveals() {
    const els = $$(".reveal, .services .svc, .offers .offer, .journal .jcard");
    if (!("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("in")); return; }
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { const el = en.target; const sib = Array.from(el.parentElement.children).indexOf(el); el.style.transitionDelay = Math.min(sib, 5) * 0.08 + "s"; el.classList.add("in"); io.unobserve(el); } }), { rootMargin: "0px 0px -8% 0px" });
    els.forEach((e) => io.observe(e));
  }

  /* =========================================================
     BOOT
     ========================================================= */
  (async function init() {
    grain(); navScroll();
    $("#yr").textContent = new Date().getFullYear();
    const data = await load();
    applySettings(settings);
    { const v = $("#heroVideo"); if (settings.hero_video) v.src = settings.hero_video; else if (innerWidth <= 900) { v.poster = "assets/media/hero-m-poster.jpg"; v.src = "assets/media/hero-m.mp4"; } }
    splitHero();
    portfolio = data.posts.filter((p) => p.kind === "portfolio");
    $("#aboutText").innerHTML = md(settings.about_text);
    renderServices(data.services); renderOffers(data.offers);
    renderJournal(data.posts.filter((p) => p.kind === "blog"));
    renderContact(settings); setupBooking(settings);
    marquee(settings, data.services);
    lookbook(portfolio);
    ritual(settings);
    powder(); heroTimecode(); cursor(); reveals();
    $("#lbClose").addEventListener("click", closeLb);
    $("#lb").addEventListener("click", (e) => { if (e.target.id === "lb") closeLb(); });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("#lb").hidden) closeLb(); });
    if (reduced) document.body.classList.add("loaded"); else { await preload(); document.body.classList.add("loaded"); }
  })();
})();

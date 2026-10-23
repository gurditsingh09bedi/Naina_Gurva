/* Shared helpers for the public pages */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function md(text) {
    const src = String(text || "");
    if (window.marked && window.DOMPurify) return DOMPurify.sanitize(marked.parse(src));
    return miniMd(src);
  }
  /* small markdown fallback if the CDN library can't load: headings, bold, italics, lists, links */
  function miniMd(src) {
    const inline = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/\[(.+?)\]\((https?:[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    return src.split(/\n{2,}/).map((blk) => {
      const lines = blk.split("\n");
      const h = blk.match(/^(#{1,3})\s+(.*)$/);
      if (h && lines.length === 1) return "<h" + (h[1].length + 1) + ">" + inline(h[2]) + "</h" + (h[1].length + 1) + ">";
      if (lines.every((l) => /^\s*[-*]\s+/.test(l))) return "<ul>" + lines.map((l) => "<li>" + inline(l.replace(/^\s*[-*]\s+/, "")) + "</li>").join("") + "</ul>";
      if (lines.every((l) => /^\s*\d+\.\s+/.test(l))) return "<ol>" + lines.map((l) => "<li>" + inline(l.replace(/^\s*\d+\.\s+/, "")) + "</li>").join("") + "</ol>";
      return "<p>" + lines.map(inline).join("<br>") + "</p>";
    }).join("");
  }
  function fmtDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return isNaN(d) ? "" : d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  }
  function applySettings(st) {
    $$("[data-s]").forEach((el) => { const v = st[el.dataset.s]; if (v != null && v !== "") el.textContent = v; });
    $$("[data-s-src]").forEach((el) => { const v = st[el.dataset.sSrc]; if (v) el.src = v; });
    if (st.brand_name) document.title = st.brand_name + (st.brand_suffix ? " " + st.brand_suffix : "");
  }

  /* film grain texture, generated once */
  function grain() {
    const g = $(".grain"); if (!g) return;
    const c = document.createElement("canvas"); c.width = c.height = 160;
    const x = c.getContext("2d"), d = x.createImageData(160, 160);
    for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 26; }
    x.putImageData(d, 0, 0);
    g.style.backgroundImage = "url(" + c.toDataURL() + ")";
  }

  /* floating gold dust. returns { set(intensity 0..1) } */
  function dust(canvas, opts = {}) {
    if (!canvas) return { set() {} };
    const ctx = canvas.getContext("2d");
    const N = opts.count || 70;
    let w = 0, h = 0, k = opts.intensity == null ? 1 : opts.intensity, raf = 0, visible = true;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const P = Array.from({ length: N }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.8 + 0.4, s: Math.random() * 0.25 + 0.05, a: Math.random() * Math.PI * 2, tw: Math.random() * 0.03 + 0.01 }));
    function size() { const b = canvas.getBoundingClientRect(); w = b.width; h = b.height; canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      const n = Math.round(N * (0.25 + 0.75 * k));
      for (let i = 0; i < n; i++) {
        const p = P[i];
        if (!reduced) { p.y -= p.s / 600 * (1 + k * 2); p.x += Math.sin(p.a += p.tw) / 2400; if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); } }
        const al = (0.35 + 0.65 * Math.abs(Math.sin(p.a))) * (0.35 + 0.65 * k);
        const gx = p.x * w, gy = p.y * h, rr = p.r * (1 + k * 0.8);
        const grd = ctx.createRadialGradient(gx, gy, 0, gx, gy, rr * 4);
        grd.addColorStop(0, "rgba(246,222,170," + al + ")"); grd.addColorStop(1, "rgba(246,222,170,0)");
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(gx, gy, rr * 4, 0, 6.283); ctx.fill();
      }
      if (!reduced && visible) raf = requestAnimationFrame(draw);
    }
    size(); addEventListener("resize", size);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((es) => { visible = es[0].isIntersecting; cancelAnimationFrame(raf); if (visible) draw(); }).observe(canvas);
    }
    draw();
    return { set(v) { k = Math.max(0, Math.min(1, v)); if (reduced) draw(); } };
  }

  function timecode(sec) {
    const f = Math.floor((sec % 1) * 24), s = Math.floor(sec) % 60, m = Math.floor(sec / 60) % 60, h = Math.floor(sec / 3600);
    return [h, m, s, f].map((n) => String(n).padStart(2, "0")).join(":");
  }

  function navScroll() {
    const n = $("#nav"); if (!n) return;
    const on = () => n.classList.toggle("solid", scrollY > 40);
    on(); addEventListener("scroll", on, { passive: true });
  }

  window.UI = { $, $$, esc, md, miniMd, fmtDate, applySettings, grain, dust, timecode, navScroll, reduced };
})();

/*
  Email via EmailJS (free plan, sends from Naina's own Hotmail/Outlook account).
  Set up once: see README → "Email notifications". Until the three IDs are in config.js,
  the site falls back to opening the email app or WhatsApp with the message ready to send.
*/
(function () {
  const cfg = (window.SITE_CONFIG && window.SITE_CONFIG.EMAILJS) || {};
  const ready = !!(cfg.publicKey && cfg.serviceId && cfg.templateId);
  const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const siteUrl = () => location.href.replace(/[#?].*$/, "").replace(/[^/]*$/, "");
  const niceDate = (d) => { if (!d) return ""; const x = new Date(d + "T12:00"); return isNaN(x) ? d : x.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }); };

  async function send({ to, toName, subject, html, replyTo, fromName }) {
    if (!ready) throw new Error("Email isn't set up yet (EmailJS keys missing in config.js).");
    if (!to) throw new Error("No email address to send to.");
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service_id: cfg.serviceId, template_id: cfg.templateId, user_id: cfg.publicKey,
        template_params: { to_email: to, to_name: toName || "", subject, html, reply_to: replyTo || "", from_name: fromName || "" } })
    });
    if (!res.ok) throw new Error("Email didn't send (" + res.status + "): " + (await res.text()).slice(0, 140));
  }

  /* ---------- branded email layout ---------- */
  function layout(st, title, bodyHtml) {
    const brand = esc(st.brand_name + (st.brand_suffix ? " " + st.brand_suffix : ""));
    const logo = siteUrl() + "assets/img/logo-badge-160.png";
    const contact = [st.phone && "Phone/WhatsApp: " + esc(st.phone), (st.legal_email || st.email) && "Email: " + esc(st.legal_email || st.email)].filter(Boolean).join(" · ");
    return `<div style="background:#f6efe6;padding:24px 12px;font-family:Georgia,'Times New Roman',serif;color:#2a1a22">
      <div style="max-width:560px;margin:0 auto;background:#fffaf4;border:1px solid #e6d6bd;border-radius:8px;overflow:hidden">
        <div style="text-align:center;padding:26px 20px 10px"><img src="${logo}" width="84" height="84" alt="${brand}" style="border-radius:50%;display:inline-block"></div>
        <h1 style="margin:0;padding:0 28px;text-align:center;font-weight:normal;font-style:italic;font-size:26px">${esc(title)}</h1>
        <div style="padding:18px 28px 6px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#3b2a31">${bodyHtml.replace(/<p>/g, '<p style="margin:0 0 12px">')}</div>
        <div style="padding:16px 28px 24px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#7a6670;border-top:1px solid #efe3d2;margin-top:14px">
          ${brand}${st.legal_name ? " · a trading name of " + esc(st.legal_name) : ""}<br>${contact}<br>
          <a href="${siteUrl()}terms.html" style="color:#9c7638">Booking terms</a> · <a href="${siteUrl()}privacy.html" style="color:#9c7638">Privacy notice</a>
        </div>
      </div></div>`;
  }
  function detailsTable(b, extra) {
    const rows = [["Occasion", b.occasion], ["Date", niceDate(b.event_date)], ["Ready by", b.ready_by], ["Number of faces", b.faces], ["Location", b.location]].concat(extra || []).filter((r) => r[1]);
    return `<table style="width:100%;border-collapse:collapse;margin:12px 0 16px;font-size:14px">${rows.map(([k, v]) => `<tr><td style="padding:7px 0;border-bottom:1px solid #efe3d2;color:#7a6670;width:42%">${esc(k)}</td><td style="padding:7px 0;border-bottom:1px solid #efe3d2"><b>${esc(v)}</b></td></tr>`).join("")}</table>`;
  }
  const first = (n) => esc(String(n || "").trim().split(/\s+/)[0] || "there");
  const para = (t) => String(t || "").trim() ? `<p>${esc(t).replace(/\n/g, "<br>")}</p>` : "";

  const T = {
    /* to Naina when a new request arrives */
    newBooking(st, b) {
      return { subject: `New booking request: ${b.name} · ${b.occasion || ""} · ${niceDate(b.event_date)}`,
        html: layout(st, "New booking request", `<p>You have a new request from <b>${esc(b.name)}</b>.</p>${detailsTable(b, [["Phone", b.phone], ["Email", b.email]])}${b.message ? `<p><b>Message:</b><br>${esc(b.message).replace(/\n/g, "<br>")}</p>` : ""}<p><a href="${siteUrl()}admin.html" style="display:inline-block;background:#c9a56a;color:#1c120f;padding:10px 18px;border-radius:20px;text-decoration:none">Open the admin to accept or decline</a></p>`) };
    },
    /* to the client straight after they submit */
    received(st, b) {
      return { subject: `We've got your booking request · ${st.brand_name}`,
        html: layout(st, "Thank you, we've got your request", `<p>Hi ${first(b.name)},</p><p>Thanks for your booking request. This isn't confirmed yet: we'll check the date and reply soon to confirm or suggest another time.</p>${detailsTable(b)}<p>If anything changes, just reply to this email.</p>`) };
    },
    accepted(st, b, o) {
      return { subject: `Your booking is confirmed · ${niceDate(b.event_date)} · ${st.brand_name}`,
        html: layout(st, "Your booking is confirmed", `<p>Hi ${first(b.name)},</p><p>Great news, your appointment is confirmed. Here are the details:</p>${detailsTable(b, [["Price", o.price], ["Deposit", o.deposit], ["Arrival time", o.arrival]])}${para(o.note)}<p><b>Before your appointment</b></p><ul style="padding-left:18px;margin:0 0 12px"><li>Arrive with clean, moisturised skin and no makeup if you can.</li><li>Tell us about any allergies or skin sensitivities before the day.</li><li>You can cancel within 14 days of this confirmation; see our booking terms for the details.</li></ul><p>Can't wait to work with you.</p><p>${esc(st.owner_signoff || st.brand_name)}</p>`) };
    },
    declined(st, b, o) {
      return { subject: `About your booking request · ${st.brand_name}`,
        html: layout(st, "About your booking request", `<p>Hi ${first(b.name)},</p><p>Thank you for thinking of us for ${esc(b.occasion ? b.occasion.toLowerCase() : "your event")} on ${esc(niceDate(b.event_date))}. Unfortunately we can't take this booking.</p><p><b>Reason:</b> ${esc(o.reason)}</p>${para(o.note)}<p>We'd still love to help if another date works, so just reply to this email.</p><p>${esc(st.owner_signoff || st.brand_name)}</p>`) };
    }
  };

  /* plain-text versions for WhatsApp / email app fallback */
  const plain = {
    accepted: (st, b, o) => `Hi ${String(b.name || "").split(" ")[0]}, your booking with ${st.brand_name}${st.brand_suffix ? " " + st.brand_suffix : ""} is confirmed ✨\n\n${b.occasion || "Appointment"}: ${niceDate(b.event_date)}${b.ready_by ? "\nReady by: " + b.ready_by : ""}${o.arrival ? "\nI'll arrive at: " + o.arrival : ""}${b.location ? "\nLocation: " + b.location : ""}${o.price ? "\nPrice: " + o.price : ""}${o.deposit ? "\nDeposit: " + o.deposit : ""}${o.note ? "\n\n" + o.note : ""}\n\nBooking terms: ${siteUrl()}terms.html`,
    declined: (st, b, o) => `Hi ${String(b.name || "").split(" ")[0]}, thank you for your booking request for ${niceDate(b.event_date)}. Unfortunately I can't take this booking: ${o.reason}.${o.note ? " " + o.note : ""} If another date works, I'd love to help. ${st.brand_name}`
  };

  window.Mailer = { ready, send, T, plain, niceDate };
})();

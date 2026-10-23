/* Privacy notice and booking terms. Business details come from Admin → Website text & photos → Business & legal details. */
(async function () {
  const { $, esc, applySettings, grain } = UI;
  grain();
  let st;
  try { st = await Store.settings(); } catch (e) { st = SEED.settings; }
  applySettings(st);
  const page = document.body.dataset.page;
  const brand = esc(st.brand_name + (st.brand_suffix ? " " + st.brand_suffix : ""));
  const owner = st.legal_name ? esc(st.legal_name) : brand;
  const email = st.legal_email || st.email;
  const contactBits = [
    email ? `email <b>${esc(email)}</b>` : "",
    st.whatsapp ? `WhatsApp <b>${esc(st.whatsapp)}</b>` : (st.phone ? `phone <b>${esc(st.phone)}</b>` : ""),
    st.legal_address ? `write to <b>${esc(st.legal_address).replace(/\n/g, ", ")}</b>` : ""
  ].filter(Boolean);
  const contact = contactBits.length ? contactBits.join(", or ") : "use the contact details on our website";
  const months = parseInt(st.retention_months, 10) || 12;
  const updated = "24 October 2026";

  const privacy = `
    <h1>Privacy notice</h1>
    <p class="lead">How ${brand} uses your personal information. Last updated ${updated}.</p>

    <h2>Who we are</h2>
    <p>${brand} is a makeup artistry business${st.legal_name ? ` run by ${owner}` : ""}. We are the controller of the personal information described here. To contact us about your information, ${contact}.${st.ico_reg ? ` Our ICO registration number is ${esc(st.ico_reg)}.` : ""}</p>

    <h2>What we collect</h2>
    <ul>
      <li><b>Booking requests:</b> your name, phone or WhatsApp number, email (optional), the occasion, event date, ready-by time, number of people, location, and anything you write in the message box.</li>
      <li><b>Health details you choose to share:</b> if you tell us about allergies or skin conditions, we use this only to keep you safe during your appointment. This is special category information, and we only use it because you have chosen to give it to us for that purpose. You can ask us to delete it at any time.</li>
      <li><b>Messages</b> you send us by email, phone or WhatsApp.</li>
      <li><b>Photos:</b> we only take or share photos of you, or of your makeup, with your permission. You can withdraw permission and we will remove them from our website and social media.</li>
      <li><b>Technical information:</b> when you visit the site, our hosting and font providers receive your IP address and browser details so the page can load (see "Who we share it with").</li>
    </ul>

    <h2>Why we use it, and our lawful basis</h2>
    <ul>
      <li>To reply to your request and arrange your appointment: taking steps at your request before entering into a contract, and then performing that contract.</li>
      <li>To keep business and tax records for bookings that go ahead: legal obligation.</li>
      <li>To keep you safe if you tell us about allergies or skin conditions: your explicit consent.</li>
      <li>To share photos of our work: your consent.</li>
      <li>To keep the website secure and working: our legitimate interests.</li>
    </ul>
    <p>We do not sell your information, we do not use it for advertising, and we will not send you marketing messages unless you ask us to.</p>

    <h2>Who we share it with</h2>
    <ul>
      <li><b>Supabase</b>, which stores booking requests and website content for us as our processor${""}.</li>
      <li><b>GitHub Pages</b> (GitHub, Inc., USA), which hosts the website and processes visitors' IP addresses to deliver pages.</li>
      <li><b>Google Fonts</b> (Google, USA), which delivers the typefaces used on the site and receives visitors' IP addresses.</li>
      <li><b>EmailJS</b> and <b>Microsoft Outlook</b>, which deliver booking emails (new request alerts to us, and confirmations or replies to you).</li>
      <li><b>WhatsApp</b> (Meta), only if you choose to message us there, or if we reply to your booking there.</li>
    </ul>
    <p>Some of these providers are in the USA. Where information leaves the UK, it is protected by the UK's adequacy regulations (including the UK–US data bridge) or the provider's approved data transfer agreements.</p>

    <h2>How long we keep it</h2>
    <ul>
      <li>Booking requests that don't go ahead: deleted within ${months} months.</li>
      <li>Records of appointments that go ahead: kept for 6 years after the end of the tax year, as required for tax records.</li>
      <li>Allergy or skin information: kept only as long as you're a client, or deleted sooner if you ask.</li>
    </ul>

    <h2>Cookies and storage</h2>
    <p>This website does not use advertising or tracking cookies, and it does not use analytics. The admin area stores a sign-in token in the browser so the business owner can stay logged in; this is strictly necessary for that feature and is never used for visitors.</p>

    <h2>Your rights</h2>
    <p>You have the right to ask for a copy of your information, to have it corrected or deleted, to restrict or object to how we use it, to ask for it to be transferred, and to withdraw consent at any time. To use any of these rights, ${contact}. We will reply within one month.</p>

    <h2>Complaints</h2>
    <p>If you're unhappy with how we've handled your information, please tell us first. We will acknowledge your complaint within 30 days and let you know the outcome. You can also complain to the Information Commissioner's Office: ico.org.uk/make-a-complaint, or 0303 123 1113.</p>`;

  const terms = `
    <h1>Booking terms</h1>
    <p class="lead">The terms for appointments with ${brand}. Last updated ${updated}.</p>

    <h2>1. Who you're booking with</h2>
    <p>${brand}${st.legal_name ? ` is a trading name of ${owner}` : ""}.${st.legal_address ? ` Address: ${esc(st.legal_address).replace(/\n/g, ", ")}.` : ""} Contact: ${contact}.</p>

    <h2>2. How booking works</h2>
    <p>Sending the booking form is a request, not a confirmed booking. We will contact you to check availability, agree the services, price and timings, and confirm in writing (by email or WhatsApp). Your booking is confirmed when we send that confirmation.</p>

    <h2>3. Prices</h2>
    <p>Prices on our website are the full price for the service, including all mandatory charges. "From" prices show the lowest price for that service; we will confirm your exact price before you book. ${esc(st.travel_text || "")}</p>

    <h2>4. Deposits</h2>
    <p>${esc(st.deposit_text || "")}</p>

    <h2>5. Your right to cancel</h2>
    <p>Because you book with us at a distance (online, by phone or message), you have a legal right to cancel within 14 days of your booking being confirmed, without giving a reason.</p>
    <p>If you ask us to carry out your appointment within those 14 days and then cancel, you may need to pay for any work already done. Once your appointment has been fully carried out, the right to cancel ends.</p>
    <p>Outside the 14-day period, please give us as much notice as you can. We will only keep money to cover losses we can't avoid, such as turning away other bookings for your date, and we'll tell you how we've worked this out.</p>

    <h2>6. If we have to cancel</h2>
    <p>If we can't attend because of illness or an emergency, we'll tell you as soon as possible, try to arrange a suitable replacement artist if you'd like one, and otherwise refund everything you've paid us for that appointment.</p>

    <h2>7. Allergies, skin and patch tests</h2>
    <p>Please tell us about any allergies, sensitivities or skin conditions before your appointment. For some products, such as lash adhesives, we recommend a patch test at least 48 hours beforehand. We may adjust or decline a service if we think it isn't safe for your skin.</p>

    <h2>8. Photos</h2>
    <p>We would love to share photos of your look, but we will always ask first. You can say no, or change your mind later, and we'll remove them.</p>

    <h2>9. Offers</h2>
    <p>Offers shown on our website apply to bookings confirmed while the offer is live, cannot be combined unless we say so, and any end date is shown with the offer.</p>

    <h2>10. Complaints</h2>
    <p>If you're unhappy with any part of our service, please tell us within a few days so we can try to put it right. Nothing in these terms affects your legal rights as a consumer.</p>

    <h2>11. Law</h2>
    <p>These terms are governed by the law of the part of the UK where you live, and you can bring a claim in the courts there.</p>`;

  $("#legal").innerHTML = page === "terms" ? terms : privacy;
  document.title = (page === "terms" ? "Booking terms" : "Privacy notice") + " · " + st.brand_name;
})();

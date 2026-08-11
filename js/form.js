/* ESKA METALWORKS – form.js */
(function () {
  'use strict';

  const form = document.getElementById('contact-form');
  if (!form) return;

  const msgEl = document.getElementById('form-msg');

  function showMsg(type, text) {
    msgEl.className = 'form-msg ' + type;
    msgEl.textContent = text;
    msgEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function validate(data) {
    if (!data.name.trim())    return 'Please enter your name.';
    if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      return 'Please enter a valid email address.';
    if (!data.phone.trim() || !/^[\d\s\+\-\(\)]{7,15}$/.test(data.phone))
      return 'Please enter a valid phone number.';
    if (!data.message.trim() || data.message.trim().length < 10)
      return 'Message must be at least 10 characters.';
    return null;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Honeypot check
    if (form.querySelector('.honeypot')?.value) return;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const err = validate(data);
    if (err) { showMsg('error', err); return; }

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData,
      });

      if (res.ok) {
        showMsg('success', '✓ Message sent! We will get back to you shortly.');
        form.reset();
      } else {
        showMsg('error', 'Something went wrong. Please call us directly at 0708 433 265.');
      }
    } catch {
      showMsg('error', 'Network error. Please try again or call 0708 433 265.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }
  });
})();

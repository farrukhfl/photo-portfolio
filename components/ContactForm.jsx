'use client';

import { useState } from 'react';
import { SITE } from '@/lib/site';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // No email service is wired up yet — the form opens the visitor's mail client
  // pre-filled. Swap for an API call later if you add a mail provider.
  function submit(e) {
    e.preventDefault();
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`);
    const subject = encodeURIComponent(form.subject || `Shoot inquiry from ${form.name}`);
    window.location.href = `mailto:${SITE.email}?subject=${subject}&body=${body}`;
  }

  return (
    <form className="form" onSubmit={submit}>
      <div className="form-row">
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" value={form.name} onChange={set('name')} required />
        </div>
        <div className="field">
          <label htmlFor="cemail">Email</label>
          <input id="cemail" type="email" value={form.email} onChange={set('email')} required />
        </div>
      </div>
      <div className="field">
        <label htmlFor="subject">Subject</label>
        <input id="subject" value={form.subject} onChange={set('subject')} placeholder="e.g. Shoot for a 992 GT3 RS" />
      </div>
      <div className="field">
        <label htmlFor="message">Message</label>
        <textarea id="message" rows={6} value={form.message} onChange={set('message')} required placeholder="The car, the location idea, timing…" />
      </div>
      <div>
        <button className="btn">Send Message</button>
        <p style={{ fontSize: 12, color: 'var(--faint)', marginTop: 10 }}>Opens your email app with the message pre-filled.</p>
      </div>
    </form>
  );
}

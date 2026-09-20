'use client';

import { useState } from 'react';
import styles from './Contact.module.css';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

interface FieldErrors {
  name?: string;
  email?: string;
  message?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Lightweight client-side validation for UX; the server re-validates with Zod. */
function validate(values: { name: string; email: string; message: string }): FieldErrors {
  const errors: FieldErrors = {};
  if (values.name.trim().length < 2) errors.name = 'Please enter your name (2+ characters).';
  if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Please enter a valid email address.';
  if (values.message.trim().length < 10) errors.message = 'Message must be at least 10 characters.';
  return errors;
}

/**
 * Contact form. Subm to POST /api/contact which performs the authoritative
 * Zod validation, rate limiting and persistence. This component is purely a
 * presentation + UX layer and never trusts its own result as final.
 */
export default function Contact() {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({ name: '', email: '', message: '', company: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<FormStatus>('idle');
  const [feedback, setFeedback] = useState('');

  const update = (field: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    if (field !== 'company') setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fieldErrors = validate(values);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setStatus('submitting');
    setFeedback('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
        details?: Record<string, string[]>;
      };

      if (res.ok && data.success) {
        setStatus('success');
        setFeedback('Message sent. Thank you — I will get back to you soon.');
        setValues({ name: '', email: '', message: '', company: '' });
        return;
      }

      if (res.status === 429) {
        setStatus('error');
        setFeedback(data.error ?? 'Too many requests. Please try again later.');
        return;
      }

      if (res.status === 400 && data.details) {
        const mapped: FieldErrors = {};
        for (const [key, msgs] of Object.entries(data.details)) {
          if (key === 'name' || key === 'email' || key === 'message') {
            mapped[key] = msgs[0];
          }
        }
        setErrors(mapped);
      }

      setStatus('error');
      setFeedback(data.error ?? 'Please check the form and try again.');
    } catch {
      setStatus('error');
      setFeedback('Network error. Please try again.');
    }
  };

  return (
    <section className={`contact ${styles.contact}`} aria-label="Contact form">
      <button
        type="button"
        className={`magnetic ${styles.contactToggle}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="contact-form"
      >
        <i className="fa-solid fa-paper-plane" aria-hidden="true" />
        <span>{open ? 'Hide contact form' : 'Send a message'}</span>
      </button>

      {open && (
        <form id="contact-form" className={styles.contactForm} onSubmit={onSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="contact-name">
              NAME
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              className={styles.input}
              value={values.name}
              onChange={update('name')}
              autoComplete="name"
              required
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'contact-name-error' : undefined}
            />
            {errors.name && (
              <span id="contact-name-error" className={styles.errorText} role="alert">
                {errors.name}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="contact-email">
              EMAIL
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              className={styles.input}
              value={values.email}
              onChange={update('email')}
              autoComplete="email"
              required
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'contact-email-error' : undefined}
            />
            {errors.email && (
              <span id="contact-email-error" className={styles.errorText} role="alert">
                {errors.email}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="contact-message">
              MESSAGE
            </label>
            <textarea
              id="contact-message"
              name="message"
              className={styles.textarea}
              value={values.message}
              onChange={update('message')}
              rows={4}
              required
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? 'contact-message-error' : 'contact-message-note'}
            />
            {errors.message ? (
              <span id="contact-message-error" className={styles.errorText} role="alert">
                {errors.message}
              </span>
            ) : (
              <span id="contact-message-note" className={styles.fieldNote}>
                At least 10 characters.
              </span>
            )}
          </div>

          {/* Honeypot: hidden from users, catches naive bots. */}
          <div className={styles.honeypot} aria-hidden="true">
            <label htmlFor="contact-company">Company</label>
            <input
              id="contact-company"
              name="company"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={values.company}
              onChange={update('company')}
            />
          </div>

          <button type="submit" className={styles.submit} disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Sending…' : 'Send message'}
          </button>

          {feedback && (
            <p
              className={`${styles.status} ${status === 'success' ? styles.statusSuccess : styles.statusError
                }`}
              role="status"
              aria-live="polite"
            >
              {feedback}
            </p>
          )}
        </form>
      )}
    </section>
  );
}

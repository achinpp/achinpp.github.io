import { useCallback, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Check, Send } from 'lucide-react';
import { FORM_ENDPOINT, GUARD, SIMULATE_SEND } from '@/data/contact';
import { PROFILE } from '@/data/profile';
import { duration, easeOutExpo } from '@/lib/motion/easings';
import { fadeUp } from '@/lib/motion/variants';

type FieldName = 'name' | 'email' | 'message';
type Status = 'idle' | 'sending' | 'sent' | 'error';

const EMPTY: Record<FieldName, string> = { name: '', email: '', message: '' };
const UNTOUCHED: Record<FieldName, boolean> = { name: false, email: false, message: false };

/**
 * Deliberately loose on the address. A stricter pattern rejects valid
 * addresses — plus-tags, new TLDs, quoted locals — and the only check that
 * actually proves an address works is sending to it.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const VALIDATE: Record<FieldName, (value: string) => string | null> = {
  name: (v) => (v.trim().length < 2 ? 'Needs at least 2 characters.' : null),
  email: (v) => (EMAIL_RE.test(v.trim()) ? null : 'That address will not route.'),
  message: (v) => (v.trim().length < 10 ? 'Needs at least 10 characters.' : null),
};

/** sessionStorage throws outright in some privacy modes. */
function readLastSend() {
  try {
    return Number(window.sessionStorage.getItem(GUARD.storageKey)) || 0;
  } catch {
    return 0;
  }
}

function writeLastSend() {
  try {
    window.sessionStorage.setItem(GUARD.storageKey, String(Date.now()));
  } catch {
    /* throttling is a courtesy, not a requirement */
  }
}

type FieldProps = {
  name: FieldName;
  label: string;
  value: string;
  error: string | null;
  /** Errors appear on blur or on submit, never while first typing. */
  showError: boolean;
  placeholder: string;
  multiline?: boolean;
  type?: string;
  autoComplete?: string;
  onChange: (name: FieldName, value: string) => void;
  onBlur: (name: FieldName) => void;
};

function Field({
  name,
  label,
  value,
  error,
  showError,
  placeholder,
  multiline,
  type = 'text',
  autoComplete,
  onChange,
  onBlur,
}: FieldProps) {
  const id = `contact-${name}`;
  const errorId = `${id}-error`;
  const invalid = showError && error !== null;

  const shared = {
    id,
    name,
    value,
    placeholder,
    autoComplete,
    'aria-invalid': invalid,
    'aria-describedby': invalid ? errorId : undefined,
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(name, e.target.value),
    onBlur: () => onBlur(name),
    // The wrapper shows focus instead (see below), so the default ring isn't
    // drawn inside a border it doesn't match.
    className:
      'min-w-0 flex-1 resize-none bg-transparent font-mono text-sm leading-relaxed text-ink outline-none placeholder:text-obsidian-600',
  };

  return (
    <div>
      <label htmlFor={id} className="block font-mono text-label text-ink-faint uppercase">
        {label}
      </label>

      {/* Focus lands on the wrapper's border and glow. Removing an input's
          outline without replacing the indicator leaves keyboard users with
          no idea where they are. */}
      <div
        className={`mt-2.5 flex items-start gap-2.5 rounded-lg border bg-obsidian-900/60 px-3.5 py-3 transition-[border-color,box-shadow] duration-200 ease-out-expo focus-within:shadow-glow-xs ${
          invalid
            ? 'border-breach-600 focus-within:border-breach-400'
            : 'border-hairline focus-within:border-mint-400'
        }`}
      >
        <span aria-hidden className="mt-px shrink-0 font-mono text-sm text-mint-700 select-none">
          &gt;
        </span>
        {multiline ? <textarea rows={5} {...shared} /> : <input type={type} {...shared} />}
      </div>

      {invalid && (
        <p
          id={errorId}
          className="mt-2 font-mono text-[0.625rem] tracking-[0.12em] text-breach-400 uppercase"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * The secure channel.
 *
 * **Spam handling is two client-side speed bumps and one real filter.** The
 * `_gotcha` honeypot is Formspree's own convention and is dropped
 * *server-side* — deliberately not branched on here, because password
 * managers do sometimes fill hidden fields and a client-side honeypot check
 * would show a real person a false "sent". The two local guards are a minimum
 * fill time and a minimum gap between sends; both only stop the trivial case
 * of a script that fills every field and posts instantly.
 *
 * **With no endpoint configured it does not pretend.** In dev the round-trip
 * is simulated so the TRANSMITTING → SENT states can be reviewed, with a
 * banner saying so. In production the button is disabled and the email
 * address beside the form is the working path. See `src/data/contact.ts`.
 */
export function ContactForm() {
  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState(UNTOUCHED);
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [failure, setFailure] = useState<string | null>(null);

  /** Start of the fill window, for the "too fast to be human" guard. */
  const openedAt = useRef(Date.now());

  const canSend = FORM_ENDPOINT !== null || SIMULATE_SEND;

  const errors: Record<FieldName, string | null> = {
    name: VALIDATE.name(values.name),
    email: VALIDATE.email(values.email),
    message: VALIDATE.message(values.message),
  };

  const onChange = useCallback((name: FieldName, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const onBlur = useCallback((name: FieldName) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const reset = useCallback(() => {
    setValues(EMPTY);
    setTouched(UNTOUCHED);
    setSubmitted(false);
    setStatus('idle');
    setFailure(null);
    openedAt.current = Date.now();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setFailure(null);

    if (Object.values(errors).some((error) => error !== null)) return;

    if (Date.now() - openedAt.current < GUARD.minFillMs) {
      setStatus('error');
      setFailure('That was faster than a person can type. Try again.');
      return;
    }

    const last = readLastSend();
    if (last > 0 && Date.now() - last < GUARD.minGapMs) {
      setStatus('error');
      setFailure('A message just went out. Give it a minute before the next one.');
      return;
    }

    setStatus('sending');

    try {
      if (SIMULATE_SEND) {
        await new Promise((resolve) => setTimeout(resolve, 900));
      } else if (FORM_ENDPOINT) {
        const response = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ ...values, [GUARD.honeypotName]: '' }),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
      } else {
        throw new Error('no endpoint configured');
      }

      writeLastSend();
      setStatus('sent');
    } catch {
      setStatus('error');
      setFailure(`Transmission failed. Reach me directly at ${PROFILE.email}.`);
    }
  }

  if (status === 'sent') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: duration.slow, ease: easeOutExpo }}
        className="rounded-xl border border-mint-900 bg-mint-950/30 p-7 sm:p-9"
      >
        <p className="flex items-center gap-2.5 font-mono text-label-lg text-mint-300 uppercase">
          <Check aria-hidden size={16} />
          Message encrypted &amp; sent
        </p>
        <p className="mt-4 text-sm leading-relaxed text-ink-muted">
          {SIMULATE_SEND
            ? 'Nothing was actually transmitted. No endpoint is configured.'
            : 'It is in the inbox. Expect a reply from the address above.'}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-7 rounded-full border border-hairline px-5 py-2.5 font-mono text-[0.6875rem] tracking-[0.14em] text-ink-muted uppercase transition-colors duration-200 hover:border-mint-800 hover:text-mint-200"
        >
          Send another
        </button>
      </motion.div>
    );
  }

  return (
    <motion.form variants={fadeUp} onSubmit={handleSubmit} noValidate className="space-y-6">
      <Field
        name="name"
        label="Name"
        placeholder="who is calling"
        autoComplete="name"
        value={values.name}
        error={errors.name}
        showError={submitted || touched.name}
        onChange={onChange}
        onBlur={onBlur}
      />
      <Field
        name="email"
        label="Return address"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        value={values.email}
        error={errors.email}
        showError={submitted || touched.email}
        onChange={onChange}
        onBlur={onBlur}
      />
      <Field
        name="message"
        label="Message"
        placeholder="what do you need"
        multiline
        value={values.message}
        error={errors.message}
        showError={submitted || touched.message}
        onChange={onChange}
        onBlur={onBlur}
      />

      {/* Honeypot. Visually and programmatically out of the way, untabbable,
          and never read client-side — Formspree drops a filled `_gotcha`
          server-side. */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="contact-gotcha">Leave this field empty</label>
        <input
          id="contact-gotcha"
          name={GUARD.honeypotName}
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-1">
        <button
          type="submit"
          disabled={status === 'sending' || !canSend}
          className="inline-flex items-center gap-2.5 rounded-full border border-mint-800 bg-mint-950/60 px-6 py-3.5 font-mono text-label-lg text-mint-200 uppercase transition-all duration-300 ease-out-expo hover:border-mint-600 hover:shadow-glow-sm disabled:cursor-not-allowed disabled:border-hairline disabled:bg-transparent disabled:text-obsidian-500 disabled:shadow-none"
        >
          {status === 'sending' ? (
            <>
              Transmitting
              <span aria-hidden className="motion-ok:animate-caret">
                ...
              </span>
            </>
          ) : (
            <>
              <Send aria-hidden size={14} />
              Transmit
            </>
          )}
        </button>

        {/* Honest production state: the form is not wired to an inbox. */}
        {!canSend && (
          <p className="font-mono text-[0.625rem] leading-relaxed tracking-[0.12em] text-signal-400 uppercase">
            Channel not provisioned. Use the address opposite
          </p>
        )}
      </div>

      {status === 'error' && failure && (
        <p
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-breach-900 bg-breach-900/20 px-4 py-3 font-mono text-[0.6875rem] leading-relaxed tracking-[0.08em] text-breach-300"
        >
          <AlertTriangle aria-hidden size={14} className="mt-px shrink-0" />
          {failure}
        </p>
      )}

      {SIMULATE_SEND && (
        <p className="font-mono text-[0.5625rem] leading-relaxed tracking-[0.16em] text-signal-400 uppercase">
          ⚠ dev only: no VITE_FORM_ENDPOINT set, so a successful submit is simulated and nothing is
          transmitted
        </p>
      )}
    </motion.form>
  );
}

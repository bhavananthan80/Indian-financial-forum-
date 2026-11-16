import { Link } from '@tanstack/react-router';
import { useEffect, useRef, useState, type ReactNode, type FormEvent, type ComponentType } from 'react';
import { ArrowRight, ShieldCheck, Upload, CheckCircle2, Users, Landmark, Network, BookOpen, Sparkles, Globe, Briefcase, MessageSquare, Mic, CalendarDays, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { photos } from '@/lib/photos';
import { maxResumeBytes, topics } from '@/lib/submissions';

export { photos };
export type Destination = '/' | '/about' | '/professionals' | '/organisations' | '/events' | '/knowledge-hub' | '/job-seekers' | '/contact' | '/speaking';
export function Action({ children, to = '/contact', secondary = false, topic }: {
  children: ReactNode;
  to?: Destination;
  secondary?: boolean;
  topic?: typeof topics[number] | undefined;
}) {
  const target = to === '/job-seekers' ? 'profile'
    : to === '/speaking' ? 'application'
    : to === '/contact' ? 'contact-form' : undefined;
  return (
    <Button asChild size="lg" variant={secondary ? 'secondary' : 'default'}>
      <Link to={to} search={to === '/contact' && topic ? { topic } : {}} {...(target ? { hash: target } : {})}>
        {children}<ArrowRight />
      </Link>
    </Button>
  );
}
export function Eyebrow({ children }: { children: ReactNode }) { return <div className="eyebrow"><span />{children}</div>; }
export function Section({ children, title, eyebrow, description, blue = false, centered = false, id }: { children?: ReactNode; title?: string; eyebrow?: string; description?: string; blue?: boolean; centered?: boolean; id?: string }) { return <section id={id} className={`section ${blue ? 'section-blue' : ''}`}><div className="container">{title && <div className={`section-heading ${centered ? 'centered' : ''}`}><Eyebrow>{eyebrow}</Eyebrow><h2>{title}</h2>{description && <p>{description}</p>}</div>}{children}</div></section>; }
export function Hero({
  eyebrow, title, description, image, caption, action = 'Become a Member', to = '/contact',
  topic, stats, children, dark = false,
}: {
  eyebrow: string; title: ReactNode; description: string; image?: string; caption?: string;
  action?: string; to?: Destination; topic?: typeof topics[number] | undefined; stats?: [string, string][];
  children?: ReactNode; dark?: boolean;
}) {
  const cover = dark && image;
  return (
    <section className={`page-hero ${dark ? 'hero-dark' : ''} ${image ? 'has-image' : ''} ${cover ? 'hero-cover' : ''}`}>
      {cover && <img className="hero-cover-image" src={image} alt={caption ?? ''} fetchPriority="high" />}
      <div className="container hero-grid">
        <div className="hero-copy">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1>{title}</h1>
          <p>{description}</p>
          {(action || children) && <div className="hero-buttons">
            {action && <Action to={to} topic={topic ?? (action === 'Become a Member' ? 'Membership' : undefined)}>{action}</Action>}
            {children}
          </div>}
          {stats && <Stats items={stats} compact />}
        </div>
        {image && !cover && <figure className="hero-photo">
          <img src={image} alt={caption ?? ''} fetchPriority="high" />
        </figure>}
      </div>
    </section>
  );
}
export function Stats({ items, compact = false, animated = false }: { items: [string, string][]; compact?: boolean; animated?: boolean }) {
  const container = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(animated ? 0 : 1);
  useEffect(() => {
    const element = container.current;
    if (!animated || !element) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const finish = () => { cancelAnimationFrame(frame); setProgress(1); };
    if (motion.matches || !('IntersectionObserver' in window)) { finish(); return; }
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const elapsed = Math.min((now - start) / 1600, 1);
        setProgress(1 - Math.pow(1 - elapsed, 3));
        if (elapsed < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    observer.observe(element);
    const onMotionChange = () => { if (motion.matches) { observer.disconnect(); finish(); } };
    motion.addEventListener('change', onMotionChange);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); motion.removeEventListener('change', onMotionChange); };
  }, [animated]);
  return <div ref={container} className={`${compact ? 'stats compact-stats' : 'stats'}${animated ? ' animated-stats' : ''}`}>{items.map(([value, label]) => {
    const match = value.match(/^([\d,]+)(.*)$/);
    const displayed = animated && match ? `${Math.round(Number((match[1] || '').replaceAll(',', '')) * progress).toLocaleString('en-US')}${match[2] || ''}` : value;
    return <div key={label}><strong aria-label={animated ? value : undefined}><span aria-hidden={animated ? true : undefined}>{displayed}</span></strong><span>{label}</span></div>;
  })}</div>;
}
const icons = [Landmark, Users, Network, TrendingUp, Briefcase, ShieldCheck, BookOpen, Globe, Sparkles, Mic];
export function FeatureGrid({ items, columns = 3 }: { items: { title: string; text: string; link?: string; to?: Destination; icon?: ComponentType<{ size?: number }> }[]; columns?: number }) { return <div className={`feature-grid columns-${columns}`}>{items.map((item, i) => { const Icon = item.icon || icons[i % icons.length] || Landmark; return <article className="feature-card" key={item.title}><div className={`feature-icon tone-${i % 4}`}><Icon size={22} /></div><h3>{item.title}</h3><p>{item.text}</p>{item.link && <Link className="text-link" to={item.to || '/contact'}>{item.link}<ArrowRight size={16} /></Link>}</article>; })}</div>; }
export function Partners() { return <div className="partners">{['SBI', 'HDFC BANK', 'ICICI BANK', 'AXIS BANK', 'Kotak', 'BAJAJ FINSERV', 'Adani'].map(name => <span key={name}>{name}</span>)}</div>; }
export function Callout({
  title = 'Ready to be part of what’s next?',
  text = 'Join India’s financial community to connect, collaborate and create meaningful impact.',
  action = 'Become a Member', to = '/contact', image = photos.reception, topic,
}: {
  title?: string; text?: string; action?: string; to?: Destination;
  image?: string; topic?: typeof topics[number] | undefined;
}) {
  return (
    <section className="section closing-section">
      <div className="container">
        <div className="callout">
          <img className="callout-image" src={image} alt="" loading="lazy" />
          <div className="callout-copy">
            <h2>{title}</h2><p>{text}</p>
            <Action to={to} topic={topic ?? (action === 'Become a Member' ? 'Membership' : undefined)}>{action}</Action>
          </div>
        </div>
      </div>
    </section>
  );
}

const contactFields = [
  { name: 'name', label: 'Full Name', type: 'text' },
  { name: 'organisation', label: 'Organisation', type: 'text' },
  { name: 'email', label: 'Work Email', type: 'email' },
] as const;
const careerFields = [
  { name: 'name', label: 'Name', type: 'text' },
  { name: 'organisation', label: 'Current Organisation', type: 'text' },
  { name: 'designation', label: 'Current Designation', type: 'text' },
  contactFields[2],
  { name: 'linkedin', label: 'LinkedIn Profile', type: 'url', optional: true },
] as const;
const speakerFields = [
  careerFields[0], contactFields[1], { name: 'designation', label: 'Designation', type: 'text' },
  { name: 'linkedin', label: 'LinkedIn Profile', type: 'url' },
  { name: 'expertise', label: 'Areas of Expertise', type: 'text' },
];

export function ApplicationForm({ kind = 'contact', topic }: {
  kind?: 'contact' | 'career' | 'speaker';
  topic?: typeof topics[number] | undefined;
}) {
  const [result, setResult] = useState<{ ok: boolean; text: string }>();
  const [pending, setPending] = useState(false);
  const [file, setFile] = useState('');
  const career = kind === 'career';
  const speaker = kind === 'speaker';
  const fields = career ? careerFields : speaker ? speakerFields : contactFields;
  const submitLabel = speaker ? 'Submit Application' : career ? 'Submit Profile' : 'Send Enquiry';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setPending(true);
    setResult(undefined);
    try {
      const resume = data.get('resume');
      if (resume instanceof File && resume.size > maxResumeBytes) {
        throw new Error('Your résumé must be 5 MB or smaller.');
      }
      const response = await fetch('/api/iff/submissions', { method: 'POST', body: data });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      form.reset();
      setFile('');
      setResult({ ok: true, text: 'Thank you. IFF has received your submission.' });
    } catch (error) {
      setResult({ ok: false, text: error instanceof Error ? error.message : 'Please try again.' });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="application-form" onSubmit={submit}>
      <input type="hidden" name="kind" value={kind} />
      <div className="form-grid">
        {fields.map(field => <label key={field.name}>
          {field.label} {'optional' in field && field.optional ? <small>(Optional)</small> : <span className="required">*</span>}
          <input name={field.name} required={!('optional' in field && field.optional)}
            type={field.type} maxLength={field.type === 'url' ? 2000 : field.type === 'email' ? 254 : 180} />
        </label>)}
        {kind === 'contact' && <label>
          What would you like to explore? <span className="required">*</span>
          <select name="topic" required defaultValue={topic ?? ''}>
            <option value="" disabled>Select an option</option>
            {topics.map(item => <option key={item}>{item}</option>)}
          </select>
        </label>}
        {speaker && <label className="full-field">Previous Speaking Experience <small>(Optional)</small>
          <textarea name="experience" maxLength={4000} />
        </label>}
        <label className="full-field">{speaker ? 'Short Bio' : 'Message'} {speaker ? <span className="required">*</span> : <small>(Optional)</small>}
          <textarea name="message" required={speaker} maxLength={4000} rows={4} />
        </label>
        {career && <label className="full-field">Upload Résumé <span className="required">*</span>
          <span className="upload-field"><Upload size={25} /><span>{file || 'Choose a résumé'}<small>PDF, DOC or DOCX, up to 5 MB</small></span>
            <input aria-label="Upload résumé" name="resume" type="file" required accept=".pdf,.doc,.docx"
              onChange={event => setFile(event.target.files?.[0]?.name || '')} />
          </span>
        </label>}
      </div>
      <div className="form-bottom">
        <Button type="submit" size="lg" disabled={pending}>{pending ? 'Sending…' : submitLabel}<ArrowRight /></Button>
        <span><ShieldCheck size={15} />Your details are treated confidentially.</span>
      </div>
      {result && <div className={`form-notice ${result.ok ? '' : 'form-error'}`} role={result.ok ? 'status' : 'alert'}>
        {result.ok && <CheckCircle2 size={20} />}{result.text}
      </div>}
    </form>
  );
}
const eventList = [
  { title: 'IFF Risk & Compliance Roundtable', category: 'Roundtables', text: 'Managing systemic liquidity pressures, cyber exposure and evolving regulation.' },
  { title: 'Digital Lending & FLDG Masterclass', category: 'Webinars', text: 'Decoding credit, digital lending guidelines and responsible innovation.' },
  { title: 'Women in BFSI Leadership Assembly', category: 'Networking', text: 'Connecting leaders and celebrating the perspectives shaping finance.' },
  { title: 'Treasury & Liquidity Management', category: 'Roundtables', text: 'Fresh perspectives on liquidity strategy and financial resilience.' },
] as const;

export function EventsGrid({ limit = 4 }: { limit?: number }) {
  const [filter, setFilter] = useState('All');
  const events = eventList.filter(event => filter === 'All' || event.category === filter).slice(0, limit);

  return <>
    <div className="filter-tabs" role="group" aria-label="Event categories">
      {['All', 'Roundtables', 'Webinars', 'Networking'].map(category => <Button key={category} size="sm"
        variant={filter === category ? 'default' : 'ghost'} aria-pressed={filter === category}
        onClick={() => setFilter(category)}>{category}</Button>)}
    </div>
    <div className="event-grid">
      {events.map(event => <article className="event-card" key={event.title}>
        <span className="eyebrow">{event.category}</span>
        <h3>{event.title}</h3>
        <p>{event.text}</p>
        <Link to="/contact" hash="contact-form" className="text-link">Express Interest <ArrowRight size={15} /></Link>
      </article>)}
    </div>
  </>;
}

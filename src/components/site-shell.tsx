import { Link } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { ArrowRight, Menu, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { navigation } from '@/lib/site';
import { useCms } from '@/lib/cms-context';

export function Logo({ inverse = false }: { inverse?: boolean }) {
  const { branding } = useCms();
  return <Link to="/" aria-label="Indian Financial Forum home" className={`logo ${inverse ? 'logo-inverse' : ''}`}>
    <img src={branding.logo || '/favicon.svg'} alt="Indian Financial Forum" width={145} height={50} />
  </Link>;
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState('');
  const results = navigation.filter(item => item.label.toLowerCase().includes(query.trim().toLowerCase()));

  return <header className="site-header">
    <div className="header-inner">
      <Logo />
      <nav className="desktop-nav" aria-label="Main navigation">
        {navigation.map(item => <Link key={item.to} to={item.to} activeProps={{ className: 'active' }}>{item.label}</Link>)}
      </nav>
      <div className="header-actions">
        <Button variant="ghost" size="icon" aria-label={search ? 'Close search' : 'Search pages'} aria-expanded={search}
          onClick={() => { setOpen(false); setSearch(!search); }}>{search ? <X /> : <Search />}</Button>
        <Button asChild className="join-button">
          <Link to="/contact" search={{ topic: 'Membership' }} hash="contact-form">Join IFF <ArrowRight /></Link>
        </Button>
        <Button className="mobile-menu" variant="ghost" size="icon" aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => { setSearch(false); setOpen(!open); }}>
          {open ? <X /> : <Menu />}
        </Button>
      </div>
    </div>
    {open && <nav className="mobile-nav" aria-label="Mobile navigation">
      {navigation.map(item => <Link key={item.to} to={item.to} onClick={() => setOpen(false)}>
        {item.label}<ArrowRight size={15} />
      </Link>)}
      <Link to="/speaking" onClick={() => setOpen(false)}>Speaking Opportunities <ArrowRight size={15} /></Link>
    </nav>}
    {search && <div className="search-panel" onKeyDown={event => { if (event.key === 'Escape') setSearch(false); }}>
      <label htmlFor="site-search">Search IFF</label>
      <input id="site-search" autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Find a page…" />
      {results.map(item => <Link key={item.to} to={item.to} onClick={() => setSearch(false)}>{item.label}<ArrowRight size={16} /></Link>)}
      {results.length === 0 && <p>No matching pages.</p>}
    </div>}
  </header>;
}

export function Footer() {
  const [notice, setNotice] = useState('');
  const [pending, setPending] = useState(false);

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true);
    setNotice('');
    try {
      const response = await fetch('/api/iff/submissions', { method: 'POST', body: new FormData(form) });
      if (!response.ok) throw new Error();
      form.reset();
      setNotice('You’re on the IFF mailing list.');
    } catch {
      setNotice('We couldn’t save your email. Please try again.');
    } finally {
      setPending(false);
    }
  }

  return <footer className="site-footer">
    <div className="container footer-grid">
      <div><Logo inverse /><p>Connecting leaders and practitioners across India’s banking, insurance, asset management and fintech sectors.</p></div>
      <div><h3>ABOUT IFF</h3><Link to="/about">Mission & Vision</Link><Link to="/about">Leadership Council</Link>
        <Link to="/professionals">For Professionals</Link></div>
      <div><h3>EXPLORE IFF</h3><Link to="/organisations">For Organisations</Link><Link to="/events">Events & Roundtables</Link>
        <Link to="/speaking">Speaking Opportunities</Link><Link to="/job-seekers">Careers</Link><Link to="/knowledge-hub">Knowledge Hub</Link></div>
      <div><h3>EXECUTIVE DISPATCH</h3><p>Sign up for IFF updates and invitations.</p>
        <form className="newsletter" onSubmit={subscribe}>
          <input type="hidden" name="kind" value="newsletter" />
          <input type="email" name="email" required maxLength={254} aria-label="Newsletter email" placeholder="Business email" />
          <Button type="submit" size="sm" disabled={pending}>{pending ? 'Saving…' : 'Subscribe'} <ArrowRight /></Button>
        </form>
        {notice && <p role="status">{notice}</p>}
      </div>
    </div>
    <div className="container footer-bottom"><span>© 2026 Indian Financial Forum. All rights reserved.</span></div>
  </footer>;
}

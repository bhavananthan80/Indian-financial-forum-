import { Link } from '@tanstack/react-router';
import { ArrowRight, ArrowUpRight, ChevronLeft, Layers3, LogOut, Menu, Plus, UserRound } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import type { EditorIdentity } from '@/lib/cms';

export const adminSections = {
  publications: 'Knowledge Hub', events: 'Events', leadership: 'Leadership', volunteers: 'Volunteers',
  enquiries: 'Enquiries', newsletter: 'Newsletter subscribers', photos: 'Photo library', files: 'File library',
  users: 'Users', pages: 'Page photographs', branding: 'Logo, partners & brochure',
} as const;
export type AdminSection = keyof typeof adminSections;

const groups: { title: string; sections: AdminSection[] }[] = [
  { title: 'Content', sections: ['publications', 'events'] },
  { title: 'People', sections: ['leadership', 'volunteers'] },
  { title: 'Enquiries', sections: ['enquiries', 'newsletter'] },
  { title: 'Library', sections: ['photos', 'files'] },
  { title: 'Settings', sections: ['users'] },
  { title: 'Website', sections: ['pages', 'branding'] },
];

const shortcuts: { section: AdminSection; title: string; description: string; create?: true }[] = [
  { section: 'pages', title: 'Change page photos', description: 'Swap the hero and footer photos across the website.' },
  { section: 'enquiries', title: 'View enquiries', description: 'Contact forms, membership requests, speaker applications and résumés.' },
  { section: 'events', title: 'Add an event', description: 'Appears on the Home and Events pages when visible.', create: true },
  { section: 'publications', title: 'Publish a blog, report or podcast', description: 'Goes into the Knowledge Hub once you press Publish.', create: true },
  { section: 'volunteers', title: 'Add a volunteer', description: 'Shown under Active Volunteers on About Us when visible.', create: true },
  { section: 'branding', title: 'Logo, partners & brochure', description: 'Set the header logo, partner names and partnership brochure.' },
];
const creatable: AdminSection[] = ['publications', 'events', 'leadership', 'volunteers', 'photos', 'files', 'users'];

export function AdminFrame({ section, user, onLogout, children }: {
  section?: AdminSection | undefined; user?: EditorIdentity | undefined; onLogout?: () => void; children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const visibleGroups = groups.map(group => ({ ...group,
    sections: group.sections.filter(item => item !== 'users' || user?.role === 'admin'),
  })).filter(group => group.sections.length);

  return <div className={`admin-shell ${user && open ? 'admin-nav-open' : ''}`}>
    {user && <aside className="admin-sidebar" id="admin-navigation" hidden={!open}
      onKeyDown={event => { if (event.key === 'Escape') setOpen(false); }}>
      <button className="admin-icon-button" aria-label="Close sidebar" onClick={() => setOpen(false)}><ChevronLeft size={15} /></button>
      <nav aria-label="Admin navigation">
        {visibleGroups.map(group => <details key={group.title} open>
          <summary>{group.title}</summary>
          {group.sections.map(item => <Link key={item} to="/admin" search={{ section: item }}
            aria-current={section === item ? 'page' : undefined} className={section === item ? 'selected' : ''}
            onClick={() => { if (window.matchMedia('(max-width: 720px)').matches) setOpen(false); }}>{adminSections[item]}</Link>)}
        </details>)}
      </nav>
      <button type="button" className="admin-sidebar-signout" onClick={onLogout}><LogOut size={16} /> Sign out</button>
    </aside>}
    <div className="admin-main">
      <header className="admin-bar">
        <div className="admin-crumbs">
          {user && !open && <button className="admin-icon-button" aria-label="Open sidebar" aria-controls="admin-navigation"
            aria-expanded={open} onClick={() => setOpen(true)}><Menu size={15} /></button>}
          <Link to="/admin" search={{}} aria-label="Dashboard" className="admin-mark"><Layers3 size={20} strokeWidth={2.1} /></Link>
          <span aria-hidden="true">/</span>
          <Link to="/admin" search={{}}>Dashboard</Link>
          {section && <><span aria-hidden="true">/</span><span>{adminSections[section]}</span></>}
        </div>
        {user && <button type="button" className="admin-account" aria-label={`Sign out, ${user.name}`} title={`${user.name} · Sign out`} onClick={onLogout}>
          <UserRound size={15} />
        </button>}
      </header>
      <main className="admin-content">{children}</main>
    </div>
  </div>;
}

export function AdminDashboard({ user }: { user: EditorIdentity }) {
  return <>
    <h1>Welcome to the IFF website admin</h1>
    <p className="admin-intro">Pick a task below. Changes appear on the website after you save or publish. <a href="/" target="_blank" rel="noreferrer">Open the website <ArrowUpRight size={13} /></a></p>
    <div className="admin-shortcuts">
      {shortcuts.map(item => <Link key={item.section} to="/admin" search={{ section: item.section, ...(item.create ? { create: true } : {}) }} className="admin-task">
        <strong>{item.title} <ArrowRight size={13} /></strong><p>{item.description}</p>
      </Link>)}
    </div>
    <div className="admin-groups">
      {groups.map(group => {
        const sections = group.sections.filter(item => item !== 'users' || user.role === 'admin');
        if (!sections.length) return null;
        return <section key={group.title}>
          <h2>{group.title}</h2>
          <div className="admin-collections">
            {sections.map(section => <div className="admin-collection" key={section}>
              <Link to="/admin" search={{ section }}>{adminSections[section]}</Link>
              {creatable.includes(section) && <Link to="/admin" search={{ section, create: true }} className="admin-add"
                aria-label={`Create in ${adminSections[section]}`}><Plus size={14} /></Link>}
            </div>)}
          </div>
        </section>;
      })}
    </div>
  </>;
}

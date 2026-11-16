import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { AdminInbox } from '@/components/admin-inbox';
import { editorApi } from '@/lib/editor-api';
import { Button } from '@/components/ui/button';
import { pageHead } from '@/lib/site';
import { publicationTypes, type Publication } from '@/lib/submissions';

export const Route = createFileRoute('/admin')({
  head: () => ({ meta: [...pageHead('CRM', 'Indian Financial Forum inbox and publishing workspace.').meta,
    { name: 'robots', content: 'noindex, nofollow' }] }),
  component: Admin,
});

function Admin() {
  const [posts, setPosts] = useState<Publication[] | null>(null);
  const [selection, setSelection] = useState<Publication>();
  const [tab, setTab] = useState<'publications' | 'inbox'>('publications');
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const report = useCallback((problem: unknown) => {
    if (problem === undefined) {
      setError('');
      return;
    }
    if (problem instanceof Error && 'status' in problem && problem.status === 401) {
      setPosts(null);
      setSelection(undefined);
    }
    setError(problem instanceof Error ? problem.message : 'Please try again.');
  }, []);

  useEffect(() => {
    let active = true;
    editorApi<Publication[]>('publications').then(data => {
      if (active) setPosts(data);
    }).catch(problem => {
      if (active && problem.status !== 401) report(problem);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [report]);

  const signedIn = posts !== null;
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = new FormData(event.currentTarget).get('password');
    setPending(true);
    setError('');
    try {
      await editorApi('login', { password });
      setPosts(await editorApi<Publication[]>('publications'));
    } catch (problem) {
      report(problem);
    } finally {
      setPending(false);
    }
  }

  async function logout() {
    try {
      await editorApi('logout', {});
      setPosts(null);
      setSelection(undefined);
      setTab('publications');
      setNotice('');
      setError('');
    } catch (problem) {
      report(problem);
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const status = submitter?.value ?? 'draft';
    const data = Object.fromEntries(new FormData(form));
    setPending(true);
    setError('');
    setNotice('');
    try {
      const path = selection ? `publications/${selection.id}` : 'publications';
      const { id } = await editorApi<{ id: string }>(path, { ...data, status });
      const refreshed = await editorApi<Publication[]>('publications');
      setPosts(refreshed);
      setSelection(refreshed.find(post => post.id === id));
      setNotice(status === 'published' ? 'Published to the Knowledge Hub.' : 'Draft saved.');
    } catch (problem) {
      report(problem);
    } finally {
      setPending(false);
    }
  }

  return <section className="section editor-page">
    <div className="container">
      <div className="editor-header"><h1>IFF CRM</h1>
        {signedIn && <Button onClick={logout} variant="outline">Sign out</Button>}
      </div>
      {error && <div className="form-notice form-error" role="alert">{error}</div>}
      {notice && <div className="form-notice" role="status">{notice}</div>}
      {loading ? <p>Loading workspace…</p> : !posts ? <form className="application-form editor-login" onSubmit={login}>
        <label>Editor password<input type="password" name="password" autoComplete="current-password" required /></label>
        <Button disabled={pending} type="submit">{pending ? 'Signing in…' : 'Sign in'}</Button>
      </form> : <>
        <div className="filter-tabs" role="group" aria-label="Editor sections">
          <Button variant={tab === 'publications' ? 'default' : 'outline'} aria-pressed={tab === 'publications'}
            onClick={() => { setTab('publications'); setError(''); }}>Publications</Button>
          <Button variant={tab === 'inbox' ? 'default' : 'outline'} aria-pressed={tab === 'inbox'}
            onClick={() => { setTab('inbox'); setNotice(''); setError(''); }}>Submissions inbox</Button>
        </div>
        {tab === 'publications' ? <div className="editor-grid">
          <aside className="editor-post-list">
            <Button onClick={() => { setSelection(undefined); setNotice(''); setError(''); }}>New publication</Button>
            {posts.map(post => <button type="button" key={post.id} aria-pressed={selection?.id === post.id}
              onClick={() => { setSelection(post); setNotice(''); setError(''); }}>
              <strong>{post.title}</strong><small>{post.type} · {post.status}</small>
            </button>)}
          </aside>
          <form key={selection?.id ?? 'new'} className="application-form editor-form" onSubmit={save}>
            <h2>{selection ? 'Edit publication' : 'New publication'}</h2>
            <label>Type<select name="type" defaultValue={selection?.type}>
              {publicationTypes.map(type => <option key={type}>{type}</option>)}
            </select></label>
            <label>Title<input name="title" maxLength={160} required defaultValue={selection?.title} /></label>
            <label>Summary<textarea name="summary" maxLength={350} rows={2} required defaultValue={selection?.summary} /></label>
            <label>Article text or notes<textarea name="body" maxLength={40000} rows={10} defaultValue={selection?.body} /></label>
            <label>Publication link<input name="url" type="url" maxLength={2000} defaultValue={selection?.url} />
              <small>Use a public link for reports, podcast episodes, or webinar recordings.</small>
            </label>
            <div className="editor-actions">
              <Button type="submit" value="draft" variant="outline" disabled={pending}>
                {selection?.status === 'published' ? 'Unpublish and save draft' : 'Save draft'}
              </Button>
              <Button type="submit" value="published" disabled={pending}>{pending ? 'Saving…' : 'Publish'}</Button>
            </div>
          </form>
        </div> : <AdminInbox onError={report} />}
      </>}
    </div>
  </section>;
}

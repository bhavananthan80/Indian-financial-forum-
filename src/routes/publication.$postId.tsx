import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Callout, Eyebrow, Section, photos } from '@/components/iff';
import { getPublication } from '@/lib/publications';
import { pageHead } from '@/lib/site';

export const Route = createFileRoute('/publication/$postId')({
  loader: async ({ params }) => {
    const post = await getPublication({ data: params.postId });
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData }) => loaderData ? pageHead(loaderData.title, loaderData.summary) : {},
  component: PublicationPage,
});

const actions = { Blog: 'Read the full article', Report: 'Open the report', Podcast: 'Listen to the podcast', Webinar: 'Watch the webinar' };

function PublicationPage() {
  const post = Route.useLoaderData();
  return <>
    <section className="page-hero section-blue">
      <div className="container publication-copy">
        <Link to="/knowledge-hub" className="text-link"><ArrowLeft size={16} /> Knowledge Hub</Link>
        <Eyebrow>{post.type}</Eyebrow>
        <h1>{post.title}</h1>
        <p>{post.summary}</p>
      </div>
    </section>
    <Section>
      <div className="publication-copy publication-body">
        {post.body && <div>{post.body}</div>}
        {post.url && <a className="text-link" href={post.url} target="_blank" rel="noreferrer">
          {actions[post.type]} <ArrowUpRight size={17} />
        </a>}
      </div>
    </Section>
    <Callout image={photos.reception} />
  </>;
}

import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import type { Publication } from '@/lib/submissions';

export function PublicationCards({ entries }: { entries: Publication[] }) {
  if (entries.length === 0) return <p>New publications will appear here as they are released.</p>;

  return (
    <div className="knowledge-grid">
      {entries.map(post => <article className="feature-card publication-card" key={post.id}>
        <span className="eyebrow">{post.type}</span>
        <h3>{post.title}</h3>
        <p>{post.summary}</p>
        <Link to="/publication/$postId" params={{ postId: post.id }} className="text-link">
          View {post.type.toLowerCase()} <ArrowRight size={16} />
        </Link>
      </article>)}
    </div>
  );
}

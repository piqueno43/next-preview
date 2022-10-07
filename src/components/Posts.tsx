import React from 'react';
import Link from 'next/link';
import { usePosts } from '@wpengine/headless/react';

export default function Posts() {
  const posts = usePosts();

  return (
    <div>
      {posts &&
        posts.nodes.map((post) => (
          <div key={post.id} id={`post-${post.id}`}>
            <div>
              <Link href={post.uri}>
                <h5>
                  <a href={post.uri}>{post.title}</a>
                </h5>
              </Link>
              <div
                dangerouslySetInnerHTML={{
                  __html: post.excerpt ?? '',
                }}
              />
            </div>
          </div>
        ))}
    </div>
  );
}
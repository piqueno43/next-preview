import React from 'react';
import { usePost } from '@wpengine/headless/next';

export default function Post() {
  const post = usePost();
  return (
    <div>
      {post && (
        <div>
          <div>
            <h5>{post.title}</h5>
            <div
              dangerouslySetInnerHTML={{
                __html: post.content ?? '',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
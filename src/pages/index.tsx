
import NextLink from "next/link"
import { useGetAllPostsQuery } from "../graphql/generated";
export default function Home() {
  const { data, loading } = useGetAllPostsQuery();

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      padding: '5rem',
    }}>
      {data?.posts.edges.map(({ node: post }) => (
        <div key={post.id}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridGap: "1rem",
            width: "100%",
            height: "100%",
          }}
        >
          <NextLink
            href={post.uri}
            as={post.uri}
            passHref
          >
            <a href={post.uri}>
              <h1>{post.title}</h1>
              {post.featuredImage?.node.sourceUrl && (
                <img src={post.featuredImage.node.sourceUrl} height="200" />
              )}
            </a>
          </NextLink>
          <div
            dangerouslySetInnerHTML={
              { __html: post.excerpt ?? '' }
            }
          />
        </div>
      ))}
    </div>
  )
}

import { gql } from "@apollo/client";
import { GetServerSideProps } from "next";

import { parseCookies } from "nookies";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";

import apolloClient from "../../services/apolloClient";


const GET_PAGE_BY_SLUG = gql`
query PostBySlug($slug: ID!, $asPreview: Boolean!) {
  post(id: $slug, idType: SLUG, asPreview: $asPreview) {
    id
    title
    excerpt(format: RENDERED)
    content(format: RENDERED)
    slug
    date
    modified
    isPreview
    featuredImage {
      node {
        sourceUrl
      }
    }
    author {
      node {
        name
        slug
        avatar {
          url
        }
      }
    }
    tags {
      edges {
        node {
          id
          name
          slug
        }
      }
    }
    categories {
      edges {
        node {
          id
          name
          slug
        }
      }
    }
  }
}
`;

export default function PostPreview({ post }) {
  const { user, isAuthenticated, signOut } = useContext(AuthContext);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
    }}>
      {user?.firstName && <strong>{user.firstName}</strong>} {" "}
      {user?.lastName && <strong>{user.lastName}</strong>}
      <h1>{post?.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post?.content }} />
      {isAuthenticated && (
        <button onClick={() => signOut()}>Sign out</button>
      )}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.params;
  const { 'hepta.auth.token.1.0.0': authToken } = parseCookies(context);

  const asPreview = context.query.preview === "true" ? true : false;

  if (asPreview && authToken === undefined) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
      props: {
        post: null,
        authToken: null,
      },
    };
  }

  const { data } = await apolloClient.query({
    query: GET_PAGE_BY_SLUG,
    variables: {
      slug,
      asPreview: asPreview,
    },
    context: {
      headers: authToken ? {
        Authorization: `Bearer ${authToken}`,
      } : {},
    }
  });

  if (data?.post === null) {
    return {
      notFound: true,
    };
  }



  return {
    props: {
      post: data?.post
    },
  };
}





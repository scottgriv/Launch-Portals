import React from 'react';
import { graphql } from 'gatsby';

const PortalTemplate = ({ data }) => {
  const { markdownRemark: portal } = data; // Destructuring the query result

  // Determine content based on the type
  let content;
  switch (portal.frontmatter.type) {
    case 'text':
      content = <p>{portal.frontmatter.text}</p>;
      break;
    case 'link':
      content = (
        <p>
          Visit the website: <a href={portal.frontmatter.url} target="_blank" rel="noopener noreferrer">{portal.frontmatter.url}</a>
        </p>
      );
      break;
    case 'photo':
      content = <img src={portal.frontmatter.photo} alt={portal.frontmatter.name} style={{ maxWidth: '100%', height: 'auto' }} />;
      break;
    default:
      content = <div dangerouslySetInnerHTML={{ __html: portal.html }} />;
  }

  return (
    <div style={{ margin: '0 auto', maxWidth: '700px', padding: '20px' }}>
      <h1>{portal.frontmatter.name}</h1>
      {content}
    </div>
  );
};

export const query = graphql`
  query PortalPageQuery($id: String!) {
    markdownRemark(id: { eq: $id }) {
      html
      frontmatter {
        type
        text
        photo
        link
      }
    }
  }
`;

export default PortalTemplate;

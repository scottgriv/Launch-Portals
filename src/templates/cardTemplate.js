import React from 'react';
import { graphql } from 'gatsby';

const CardTemplate = ({ data }) => {
  const { markdownRemark: card } = data; // Destructuring the query result

  return (
    <div style={{ margin: '0 auto', maxWidth: '700px', padding: '20px' }}>
      <h1>{card.frontmatter.name}</h1>
      <p>
        Visit the website: <a href={card.frontmatter.url} target="_blank" rel="noopener noreferrer">{card.frontmatter.url}</a>
      </p>
      <div dangerouslySetInnerHTML={{ __html: card.html }} />
    </div>
  );
};

export const query = graphql`
  query CardPageQuery($id: String!) {
    markdownRemark(id: { eq: $id }) {
      html
      frontmatter {
        url
      }
    }
  }
`;

export default CardTemplate;

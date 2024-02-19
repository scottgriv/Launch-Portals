import React from 'react';
import { graphql } from 'gatsby';

const CardTemplate = ({ data }) => {
  const { markdownRemark: card } = data; // Destructuring the query result

  // Determine content based on the type
  let content;
  switch (card.frontmatter.type) {
    case 'text':
      content = <p>{card.frontmatter.text}</p>;
      break;
    case 'link':
      content = (
        <p>
          Visit the website: <a href={card.frontmatter.url} target="_blank" rel="noopener noreferrer">{card.frontmatter.url}</a>
        </p>
      );
      break;
    case 'photo':
      content = <img src={card.frontmatter.photo} alt={card.frontmatter.name} style={{ maxWidth: '100%', height: 'auto' }} />;
      break;
    default:
      content = <div dangerouslySetInnerHTML={{ __html: card.html }} />;
  }

  return (
    <div style={{ margin: '0 auto', maxWidth: '700px', padding: '20px' }}>
      <h1>{card.frontmatter.name}</h1>
      {content}
    </div>
  );
};

export const query = graphql`
  query CardPageQuery($id: String!) {
    markdownRemark(id: { eq: $id }) {
      html
      frontmatter {
        type
        link
        text
        photo
      }
    }
  }
`;

export default CardTemplate;

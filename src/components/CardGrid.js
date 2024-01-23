import React, { useState, useEffect } from "react";
import { useStaticQuery, graphql } from "gatsby";

const CardGrid = () => {
  const data = useStaticQuery(graphql`
    query {
      allMarkdownRemark(sort: { fields: [frontmatter___order], order: ASC }) {
        edges {
          node {
            frontmatter {
              url
            }
            id
          }
        }
      }
    }
  `);

  const [metadata, setMetadata] = useState({});

  useEffect(() => {
    const fetchMetadata = async (url) => {
      const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}&meta`);
      const data = await response.json();
      return data.data;
    };

    data.allMarkdownRemark.edges.forEach(async ({ node }) => {
      const meta = await fetchMetadata(node.frontmatter.url);
      setMetadata((prevMetadata) => ({
        ...prevMetadata,
        [node.id]: meta,
      }));
    });
  }, [data.allMarkdownRemark.edges]);

  const handleCardClick = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div style={{
      padding: '1rem',
      backgroundColor: '#4167CF',
      border: '2px solid #FFFFFF',
      borderRadius: '10px',
      maxWidth: '1200px',
      margin: '0 auto',
    }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "10px",
      }}>
        {data.allMarkdownRemark.edges.map(({ node }) => (
          <div
            key={node.id}
            style={{
              background: "black",
              color: "white",
              padding: "0",
              border: '2px solid #FFFFFF',
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              cursor: "pointer",
              overflow: "hidden", // Ensures the image fits perfectly without overflowing
            }}
            onClick={() => handleCardClick(node.frontmatter.url)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && handleCardClick(node.frontmatter.url)}
          >
            {metadata[node.id] ? (
              <>
                <img
                  src={metadata[node.id].image?.url || 'default-placeholder.jpg'}
                  alt={`Preview of ${metadata[node.id].title || 'Website'}`}
                  style={{
                    display: "block", // Removes any extra space below the image
                    width: "100%", // Ensures the image is flush with the card edges
                    height: "auto",
                    //borderBottom: "1px solid white", // Optional: adds a subtle separator
                  }}
                />
                <div style={{
                  padding: "10px", // Tightens the text section to the image
                }}>
                  <h2 style={{margin: "10px 0 0 0"}}>{metadata[node.id].title || 'No Title Available'}</h2>
                  <p style={{margin: "5px 0"}}>{metadata[node.id].description || 'No description available.'}</p>
                  {/* Displaying the URL as plain text */}
                  <p style={{
                    color: "black",
                    fontSize: "0.8rem",
                    marginTop: "5px",
                    textAlign: "left",
                    overflowWrap: 'break-word',
                  }}>
                    {node.frontmatter.url}
                  </p>
                </div>
              </>
            ) : (
              <p>Loading metadata...</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardGrid;

import React, { useState, useEffect } from "react";
import { useStaticQuery, graphql } from "gatsby";

const CardGrid = () => {
  const data = useStaticQuery(graphql`
    query {
      allMarkdownRemark(sort: { fields: [frontmatter___order], order: ASC }) {
        edges {
          node {
            frontmatter {
              type
              order
              link
              text
              photo
            }
            id
          }
        }
      }
    }
  `);

  const [metadata, setMetadata] = useState({});

  useEffect(() => {
    const fetchMetadata = async (link) => {
      const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(link)}&meta`);
      const data = await response.json();
      return data.data;
    };

    data.allMarkdownRemark.edges.forEach(async ({ node }) => {
      if (node.frontmatter.type === 'link') {
        const meta = await fetchMetadata(node.frontmatter.link);
        setMetadata((prevMetadata) => ({
          ...prevMetadata,
          [node.id]: meta,
        }));
      }
    });
  }, [data.allMarkdownRemark.edges]);

  const handleCardClick = (type, link) => {
    if (type === 'link') {
      window.open(link, '_blank');
    }
  };

  const renderCardContent = (node) => {
    switch (node.frontmatter.type) {
      case 'text':
        return (
          <div style={{ padding: "20px" }}> {/* Add padding for text type cards */}
            <p>{node.frontmatter.text}</p>
          </div>
        );
      case 'link':
        return metadata[node.id] ? (
          <>
            <img
              src={metadata[node.id].image?.url || 'default-placeholder.jpg'}
              alt={`Preview of ${metadata[node.id].title || 'Website'}`}
              style={{
                display: "block",
                width: "100%",
                height: "auto",
              }}
            />
            <div style={{ padding: "10px" }}>
              <h2 style={{ margin: "10px 0 0 0" }}>{metadata[node.id].title || 'No Title Available'}</h2>
              <p style={{ margin: "5px 0" }}>{metadata[node.id].description || 'No description available.'}</p>
            </div>
          </>
        ) : <p>Loading metadata...</p>;
      case 'photo':
        return <img src={node.frontmatter.photo} alt="Photo" style={{ width: "100%", height: "auto" }} />;
      default:
        return <p>Unsupported content type.</p>;
    }
  };

  return (
    <div style={{
      padding: '1rem',
      backgroundColor: '', // Set your desired background color
      border: '2px solid #FE9C59',
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
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              cursor: node.frontmatter.type === 'link' ? "pointer" : "default", // Only make it a pointer for link types
              overflow: "hidden",
            }}
            onClick={() => handleCardClick(node.frontmatter.type, node.frontmatter.link)}
            role="button"
            tabIndex={0}
          >
            {renderCardContent(node)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardGrid;

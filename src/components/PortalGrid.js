import React, { useState, useEffect } from "react";
import { useStaticQuery, graphql } from "gatsby";
import { CONFIG } from './config';
import './PortalStyles.css'

const PortalGrid = () => {
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
              vportals
              hportals
            }
            id
          }
        }
      }
    }
  `);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [metadata, setMetadata] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('Loading Portal...');
  const [loadingImage, setLoadingImage] = useState('/images/loading_portal.png');

     useEffect(() => {
       const handleResize = () => {
         setWindowWidth(window.innerWidth);
       };
   
       window.addEventListener('resize', handleResize);
   
       return () => {
         window.removeEventListener('resize', handleResize);
       };
     }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        setLoadingText('Portal Not Found');
        setLoadingImage('/images/failed_portal.png'); // Change to an error image path
      }
    }, 10000); // Change the message after 5 seconds

    // Define the Netlify fetchMetadata function for server-side fetching
    const fetchMetadataNetlify = async (link) => {
      // This would make a call to your Netlify function
      try {
        const response = await fetch(`/.netlify/functions/fetchMetadata?url=${encodeURIComponent(link)}`);
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Failed to fetch metadata via Netlify:', error);
        return null;
      }
    };

    const fetchMetadataLocal = async (link) => {
      const cacheKey = `metadata-${link}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const isOlderThanADay = (Date.now() - timestamp) > 86400000; // 86400000ms = 24 hours
        if (!isOlderThanADay) {
          console.log("Returning cached data for:", link);
          return data; // Return cached data if it's not older than a day
        }
      }
    
      try {
        const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(link)}&meta`);
        const data = await response.json();
        if (response.ok) {
          console.log("Caching new data for:", link);
          localStorage.setItem(cacheKey, JSON.stringify({ data: data.data, timestamp: Date.now() })); // Cache new data with current timestamp
          return data.data;
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        console.error('Failed to fetch metadata:', error.message);
        if (cached) {
          console.log("Returning stale cached data due to error for:", link);
          return JSON.parse(cached).data; // Return stale cached data if present when fetch fails
        }
        return null; // No data could be fetched or cached
      }
    };    
   
    const fetchMetadata = CONFIG.localTesting ? fetchMetadataLocal : fetchMetadataNetlify;

    data.allMarkdownRemark.edges.forEach(async ({ node }) => {
      if (node.frontmatter.type === 'link') {
        const meta = await fetchMetadata(node.frontmatter.link);
        setMetadata((prevMetadata) => ({
          ...prevMetadata,
          [node.id]: meta,
        }));
        setLoading(false); // Once data is fetched
      }
    });
  
    return () => clearTimeout(timeoutId); // Clean up the timeout
  }, [data.allMarkdownRemark.edges, loading]);  // Include `loading` here



    /*
    const fetchMetadata = async (link) => {
      try {
        const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(link)}&meta`);
        const data = await response.json();
        if (data.status === 'fail' && data.code === 'ERATE') {
          console.error('Rate limit reached: ', data.message);
          // Implement fallback logic or display a message to the user here
        }
        return data.data;
      } catch (error) {
        console.error('Failed to fetch metadata: ', error);
      }
    };
    */

    /*
    const fetchMetadataLocal = async (link) => {
      const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(link)}&meta`);
      const data = await response.json();
      return data.data;
    };
    */

  const handlePortalClick = (type, link) => {
    if (type === 'link') {
      window.open(link, '_blank');
    }
  };
  
  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, text.lastIndexOf(' ', maxLength)) + '...';
  };

  
  const renderPortalContent = (node) => {
    console.log("Photo path:", node.frontmatter.photo); // Log the photo path

    const title = metadata[node.id] && metadata[node.id].title ? metadata[node.id].title : node.frontmatter.title;
    const truncatedTitle = truncateText(title || 'No Title Available', 150);

    switch (node.frontmatter.type) {
      case 'text':
        return (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            background: "black",
            padding: "20px",
            margin: 0,
          }}>
            <p dangerouslySetInnerHTML={{ __html: node.frontmatter.text }}></p>
          </div>
        );
        case 'link':
          return metadata[node.id] ? (
            <div style={{
              width: "100%",
              height: "100%",
              background: "black",
            }}>
              <img
                src={metadata[node.id].image?.url || '/images/placeholder_portal.png'}
                alt={`Preview of ${metadata[node.id].title || 'Website'}`}
                style={{
                  display: "block",
                  width: "100%",
                  height: "auto",
                }}
              />
              <div style={{ padding: "10px" }}>
                <h2 style={{ margin: "5px 0 0 0" }}>{truncatedTitle}</h2>
                <p style={{ margin: "5px 0" }}>{metadata[node.id].description || 'No description available.'}</p>
              </div>
            </div>
          ) : (
            <div style={{
              width: "100%",
              height: "100%",
              background: "black",  // Ensure background is black
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <img src={loadingImage} alt="Loading Portal..." style={{
                width: "50%",  // Adjust size to 50% of the container or to a fixed size like 200px
                height: "auto",  // Maintain the aspect ratio of the image
                objectFit: "contain",  // Ensures the image is fully visible, scaled to fit
                marginTop: "10px",  // Shifts the image down by 20px
              }} />
              <p className="loading-text">{loadingText}</p>
            </div>
          );
        
        case 'photo':
          return (
            <div style={{
              display: "flex",
              alignItems: "center", // Align items vertically
              justifyContent: "center", // Align items horizontally
              width: "100%",
              height: "100%",
              background: "black", // Set the background to transparent
              padding: 0, // Ensure there's no padding affecting the layout
              margin: 0, // Ensure there's no margin affecting the layout
            }}>
              <img src={node.frontmatter.photo} alt="Portal Link" style={{
                maxWidth: "100%", // Limit width to 100% of the container
                maxHeight: "100%", // Limit height to 100% of the container
                objectFit: "contain", // Maintain aspect ratio, but fit within the container
                margin: "auto", // Automatically margin for all sides
              }} />
            </div>
          );

          case 'animation':
            return (
              <div style={{
                display: "flex",
                alignItems: "center", // Align items vertically
                justifyContent: "center", // Align items horizontally
                width: "100%",
                height: "100%",
                background: "black", // Set the background to transparent
                padding: 0, // Ensure there's no padding affecting the layout
                margin: 0, // Ensure there's no margin affecting the layout
              }}>
                
                <div className="animation-container">
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
                
            </div>
            );

        default:
          return (
            <div style={{
              width: "100%",
              height: "100%",
              background: "black",  // Ensure background is black
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <img src="/images/failed_portal.png" alt="Portal Not Found" style={{
                width: "50%",  // Adjust size to 50% of the container or to a fixed size like 200px
                height: "auto",  // Maintain the aspect ratio of the image
                objectFit: "contain",  // Ensures the image is fully visible, scaled to fit
                marginTop: "10px",  // Shifts the image down by 20px
              }} />
              <p className="loading-text">Portal Not Found</p>
            </div>
          );
    }
  };


  return (
    <div style={{
      padding: '1rem',
      backgroundImage: "url('/images/background.png')",
      border: '2px solid #FA6400',
      borderRadius: '10px',
      maxWidth: '1200px',
      margin: '0 auto',
      backgroundSize: '300px 300px',  // Adjust the size to your preference
      backgroundRepeat: 'repeat'  // Makes the background image repeat
    }}>
      <div className="grid-container">
        {data.allMarkdownRemark.edges.map(({ node }) => {
          // Determine the column and row span
          let gridColumn = (windowWidth < 600 && node.frontmatter.hportals && node.frontmatter.hportals > 1) ? `span ${node.frontmatter.hportals - 1}` : `span ${node.frontmatter.hportals || 1}`;
          let gridRow = (windowWidth < 600 && node.frontmatter.vportals && node.frontmatter.vportals > 1) ? `span ${node.frontmatter.vportals - 1}` : `span ${node.frontmatter.vportals || 1}`;

                  // Function to handle key presses
        // Function to handle key presses
        const handleKeyDown = (event) => {
          // Check for 'Enter' or 'Space' key to trigger click
          if (event.key === 'Enter' || event.key === ' ') {
            handlePortalClick(node.frontmatter.type, node.frontmatter.link);
          }
        };

          return (
            <div
              key={node.id}
              style={{
                color: "white",
                padding: "0",
                borderRadius: "10px",
                border: '2px solid #FA6400',
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                cursor: node.frontmatter.type === 'link' ? "pointer" : "default",
                overflow: "hidden",
                gridColumn: gridColumn, // Dynamic column span
                gridRow: gridRow, // Dynamic row span
              }}
              onClick={() => handlePortalClick(node.frontmatter.type, node.frontmatter.link)}
              onKeyDown={handleKeyDown}  // Add keyboard listener
              role="button"
              tabIndex={0}
            >
              {renderPortalContent(node)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PortalGrid;

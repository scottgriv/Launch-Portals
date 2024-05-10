import React, { useState, useEffect } from "react"
import { useStaticQuery, graphql } from "gatsby"
import { CONFIG } from "./config"
import ReactMarkdown from "react-markdown"

// Custom Types
import PortalAnimation from "./custom/PortalAnimation" // Adjust path as necessary
import ClockWidget from "./custom/ClockWidget" // Adjust path as necessary

// Image Paths
const FAILED_IMAGE = "/images/failed_portal.png" // Portal failed image
const LOADING_IMAGE = "/images/loading_portal.png" // Portal loading image
const PLACEHOLDER_IMAGE = "/images/placeholder_portal.png" // Portal placeholder image

const PortalGrid = () => {
  const data = useStaticQuery(graphql`
    query {
      allMarkdownRemark(sort: { frontmatter: { order: ASC } }) {
        edges {
          node {
            frontmatter {
              type
              order
              text
              markdown
              photo
              file
              fileTitle
              link
              custom
              vportals
              hportals
            }
            id
          }
        }
      }
    }
  `)

  const [windowWidth, setWindowWidth] = useState(undefined)
  const [metadata, setMetadata] = useState({})
  const [loading, setLoading] = useState(true)
  const [loadingText, setLoadingText] = useState("Loading Portal...")
  const [loadingImage, setLoadingImage] = useState(LOADING_IMAGE)

  useEffect(() => {
    // Function to handle resizing
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    handleResize()

    window.addEventListener("resize", handleResize)

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        setLoadingText("Portal Not Found")
        setLoadingImage(FAILED_IMAGE)
      }
    }, 10000) // Change the message after 10 seconds

    // Define the Netlify fetchMetadata function for server-side fetching
    const fetchMetadataNetlify = async link => {
      try {
        const response = await fetch(
          `/.netlify/functions/fetchMetadata?url=${encodeURIComponent(link)}`
        )
        const data = await response.json()
        return data
      } catch (error) {
        console.error("Failed to fetch metadata via Netlify:", error)
        return null
      }
    }

    const fetchMetadataLocal = async link => {
      const cacheKey = `metadata-${link}`
      const cached = localStorage.getItem(cacheKey)

      if (cached) {
        const { data, timestamp } = JSON.parse(cached)
        const isOlderThanADay = Date.now() - timestamp > 86400000 // 86400000ms = 24 hours
        if (!isOlderThanADay) {
          console.log("Returning cached data for:", link)
          return data // Return cached data if it's not older than a day
        }
      }

      try {
        const response = await fetch(
          `https://api.microlink.io/?url=${encodeURIComponent(link)}&meta`
        )
        const data = await response.json()
        if (response.ok) {
          console.log("Caching new data for:", link)
          localStorage.setItem(
            cacheKey,
            JSON.stringify({ data: data.data, timestamp: Date.now() })
          ) // Cache new data with current timestamp
          return data.data
        } else {
          throw new Error(data.message)
        }
      } catch (error) {
        console.error("Failed to fetch metadata:", error.message)
        if (cached) {
          console.log("Returning stale cached data due to error for:", link)
          return JSON.parse(cached).data // Return stale cached data if present when fetch fails
        }
        return null // No data could be fetched or cached
      }
    }

    const fetchMetadata = CONFIG.localTesting
      ? fetchMetadataLocal
      : fetchMetadataNetlify

    data.allMarkdownRemark.edges.forEach(async ({ node }) => {
      if (node.frontmatter.type === "link") {
        const meta = await fetchMetadata(node.frontmatter.link)
        setMetadata(prevMetadata => ({
          ...prevMetadata,
          [node.id]: meta,
        }))
        setLoading(false)
      }
    })

    return () => clearTimeout(timeoutId)
  }, [data.allMarkdownRemark.edges, loading])

  const handlePortalClick = (type, link) => {
    if (type === "link") {
      window.open(link, "_blank")
    }
  }

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text
    return text.substr(0, text.lastIndexOf(" ", maxLength)) + "..."
  }

  const getIconForType = type => {
    switch (type) {
      case "text":
        return <i className="portal-icon fa-solid fa-font"></i> // Example icon for text
      case "markdown":
        return <i className="portal-icon fa-brands fa-markdown"></i> // Example icon for markdown
      case "photo":
        return <i className="portal-icon fa-solid fa-image"></i> // Example icon for photo
      case "file":
        return <i className="portal-icon fa-solid fa-file"></i> // Example icon for file
      case "link":
        return <i className="portal-icon fa-solid fa-link"></i> // Example icon for link
      case "custom":
        return <i className="portal-icon fa-solid fa-star"></i> // Example icon for custom
      default:
        return <i className="portal-icon fa-solid fa-circle-question"></i> // Fallback icon
    }
  }

  const renderPortalContent = node => {
    //console.log("Photo path:", node.frontmatter.photo); // Log the photo path

    const title =
      metadata[node.id] && metadata[node.id].title
        ? metadata[node.id].title
        : node.frontmatter.title
    const truncatedTitle = truncateText(title || "No Title Available", 150)

    switch (node.frontmatter.type) {
      case "text":
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              background: "black",
              padding: "20px",
              margin: 0,
            }}
          >
            <p dangerouslySetInnerHTML={{ __html: node.frontmatter.text }}></p>
          </div>
        )

      case "markdown":
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              background: "black",
              padding: "20px",
            }}
          >
            <ReactMarkdown>{node.frontmatter.markdown}</ReactMarkdown>
          </div>
        )

      case "photo":
        const imagePath = node.frontmatter.photo || FAILED_IMAGE

        return imagePath === node.frontmatter.photo ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              background: "black",
              padding: 0,
              margin: 0,
            }}
          >
            <img
              src={node.frontmatter.photo}
              alt="Portal Placeholder"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                margin: "auto",
              }}
            />
          </div>
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "black",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={FAILED_IMAGE}
              alt="Portal Not Found"
              style={{
                width: "50%",
                height: "auto",
                objectFit: "contain",
                marginTop: "10px",
              }}
            />
            <p className="loading-text">Image Not Found</p>
          </div>
        )

      case "file":
        const fileName = node.frontmatter.file.split("/").pop()
        const fileExtension = fileName.split('.').pop().toLowerCase();

        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              background: "black",
              padding: "20px",
            }}
          >
      <i className={`download-file-icon fa-solid fa-file${fileExtension === 'pdf' ? '-pdf' : ''}`}></i>
            <h2 style={{ padding: "5px" }}>
              {node.frontmatter.fileTitle || "No Description Available."}
            </h2>
            <a
              href={node.frontmatter.file}
              download
              style={{
                color: "var(--file-download-color)",
                textDecoration: "none",
                padding: "10px",
                border: "1px solid var(--file-download-color)",
                borderRadius: "5px",
                fontSize: "16px",
              }}
            >
              Download File
            </a>
            <div
              style={{
                textAlign: "left",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                color: "var(--link-color)",
                paddingTop: "15px",
              }}
            >
              <a
                href={node.frontmatter.file}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--link-color)", textDecoration: "none" }}
              >
                {fileName}
              </a>
            </div>
          </div>
        )

      case "link":
        return metadata[node.id] ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "black",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between", // This will space out the top and bottom parts
            }}
          >
            <div>
              <img
                src={metadata[node.id].image?.url || PLACEHOLDER_IMAGE}
                alt={`Preview of ${metadata[node.id].title || "Website"}`}
                onError={e => {
                  if (!e.target.src.endsWith(PLACEHOLDER_IMAGE)) {
                    e.target.src = PLACEHOLDER_IMAGE
                  }
                }}
                style={{
                  display: "block",
                  width: "100%",
                  height: "auto",
                }}
              />
              <div style={{ padding: "10px" }}>
                <h2 style={{ margin: "5px 0 0 0" }}>{truncatedTitle}</h2>
                <p style={{ margin: "5px 0" }}>
                  {metadata[node.id].description || "No Description Available."}
                </p>
              </div>
            </div>
            <div
              style={{
                textAlign: "left",
                padding: "10px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                color: "var(--link-color)",
              }}
            >
              <a
                href={node.frontmatter.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--link-color)", textDecoration: "none" }}
              >
                {node.frontmatter.link}
              </a>
            </div>
          </div>
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "black",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={loadingImage}
              alt="Loading Portal..."
              style={{
                width: "50%",
                height: "auto",
                objectFit: "contain",
                marginTop: "10px",
              }}
            />
            <p className="loading-text">{loadingText}</p>
          </div>
        )

      case "custom":
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              background: "black",
              padding: 0,
              margin: 0,
            }}
          >
            {node.frontmatter.custom === "animation" ? (
              <PortalAnimation />
            ) : node.frontmatter.custom === "clock" ? (
              <ClockWidget />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: "black",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={FAILED_IMAGE}
                  alt="Portal Not Found"
                  style={{
                    width: "50%",
                    height: "auto",
                    objectFit: "contain",
                    marginTop: "10px",
                  }}
                />
                <p className="loading-text">Portal Not Found</p>
              </div>
            )}
          </div>
        )

      default:
        return (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "black",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={FAILED_IMAGE}
              alt="Portal Not Found"
              style={{
                width: "50%",
                height: "auto",
                objectFit: "contain",
                marginTop: "10px",
              }}
            />
            <p className="loading-text">Portal Not Found</p>
          </div>
        )
    }
  }

  return (
    <div
      style={{
        padding: "1rem",
        backgroundImage: "var(--background-image)",
        border: "2px solid var(--accent-color)",
        borderRadius: "10px",
        maxWidth: "1200px",
        margin: "0 auto",
        backgroundSize: "300px 300px",
        backgroundRepeat: "repeat",
      }}
    >
      <div className="grid-container">
        {data.allMarkdownRemark.edges.map(({ node }) => {
          // Determine the column and row span
          let gridColumn =
            windowWidth < 600 &&
            node.frontmatter.hportals &&
            node.frontmatter.hportals === 3
              ? `span ${node.frontmatter.hportals - 1}`
              : `span ${node.frontmatter.hportals || 1}`
          let gridRow = node.frontmatter.vportals
            ? `span ${node.frontmatter.vportals}`
            : "span 1"
          //let gridRow = (windowWidth < 600 && node.frontmatter.vportals && node.frontmatter.vportals > 1) ? `span ${node.frontmatter.vportals - 1}` : `span ${node.frontmatter.vportals || 1}`;

          // Function to handle key presses
          const handleKeyDown = event => {
            // Check for 'Enter' or 'Space' key to trigger click
            if (event.key === "Enter" || event.key === " ") {
              handlePortalClick(node.frontmatter.type, node.frontmatter.link)
            }
          }

          return (
            <div
              key={node.id}
              style={{
                color: "white",
                padding: "0",
                borderRadius: "10px",
                border: "2px solid var(--accent-color)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                cursor:
                  node.frontmatter.type === "link" ? "pointer" : "default",
                overflow: "hidden",
                gridColumn: gridColumn, // Dynamic column span
                gridRow: gridRow, // Dynamic row span
              }}
              onClick={() =>
                handlePortalClick(node.frontmatter.type, node.frontmatter.link)
              }
              onKeyDown={handleKeyDown} // Add keyboard listener
              role="button"
              tabIndex={0}
            >
              {CONFIG.showPortalIcons && (
                <div className="portal-icon-container">
                  {getIconForType(node.frontmatter.type)}
                </div>
              )}
              {renderPortalContent(node)}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PortalGrid

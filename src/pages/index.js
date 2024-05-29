import React, { useState, useEffect } from "react"
import PortalGrid from "../components/PortalGrid"; // Adjust the path based on your file structure
import Seo from "../components/seo"; // Ensure this path is correct

const IndexPage = () => {
  const [showScroll, setShowScroll] = useState(false)
  const [scrollTimeout, setScrollTimeout] = useState(null)

  useEffect(() => {
    // Ensure that window is available before adding event listeners
    if (typeof window !== "undefined") {
      const handleScroll = () => {
        // Get the maximum scroll value to prevent 'over-scrolling' effects
        const maxScroll = document.body.offsetHeight - window.innerHeight

        let scrolled = window.scrollY

        // Prevent parallax effect when 'over-scrolling' happens.
        scrolled = Math.max(0, Math.min(scrolled, maxScroll))


        setShowScroll(scrolled > 500)

        // Up Scroll Arrow Configuration
        // Clear any existing timeouts to reset the timer
        if (scrollTimeout) clearTimeout(scrollTimeout)

        // Set a new timeout
        const newTimeout = setTimeout(() => {
          setShowScroll(false)
        }, 7000) // Hide button 7 seconds after scrolling stops
        setScrollTimeout(newTimeout)
      }

      window.addEventListener("scroll", handleScroll)

      return () => {
        window.removeEventListener("scroll", handleScroll)
        if (scrollTimeout) clearTimeout(scrollTimeout)
      }
    }
  }, [scrollTimeout])

  const scrollTop = () => {
    // Check if window is available
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
      // Reset scroll visibility and clear timeout
      setShowScroll(true)
      if (scrollTimeout) clearTimeout(scrollTimeout)
    }
  }

  return (
    <>
      <main>
        <PortalGrid />
      </main>
        <button
          onClick={scrollTop}
          className={`scroll-to-top ${showScroll ? "visible" : ""}`}
          aria-label="Scroll to top"
        >
          <i className="fa-solid fa-arrow-up fa-flip"></i>
        </button>
    </>
  )
}

export const Head = () => (
  <Seo title="Launch Portals" description="🚀 Portals for launching a showcase of your best work! View your websites Open Graph meta tags to ensure your projects are being displayed properly via SEO, demonstrate your portfolio, and much more." />
)

export default IndexPage;

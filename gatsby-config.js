module.exports = {
  siteMetadata: {
    title: `Launch Portals`,
    description: `A portal for launching a showcase of your best work.`,
    author: `@scottgrivner`, // Update with your information
    siteUrl: `https://scottgrivner.dev`, // Update with your site URL
  },
  plugins: [
    `gatsby-plugin-image`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `portals`,
        path: `${__dirname}/src/portals`,
      },
    },
    `gatsby-transformer-remark`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Launch Portals`,
        short_name: `Launch Portals`,
        start_url: `/`,
        background_color: `#040624`,
        theme_color: `#040624`,
        icon: `src/images/home-icon.png`, // Ensure this path is correct.
        display: `standalone`,
        include_favicon: false,
      },
    },
    // Add other plugins here as needed.
  ],
};

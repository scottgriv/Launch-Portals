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
        background_color: `#FA6400`,
        theme_color: `#FA6400`,
        icon: `src/images/icon.png`, // Ensure this path is correct.
        display: `standalone`,
      },
    },
    // Add other plugins here as needed.
  ],
};

module.exports = {
  siteMetadata: {
    title: `Launch Portal`,
    description: `A portal for launching awesome apps.`,
    author: `@yourhandle`, // Update with your information
    siteUrl: `https://yourwebsite.com`, // Update with your site URL
  },
  plugins: [
    `gatsby-plugin-image`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `cards`,
        path: `${__dirname}/src/cards`,
      },
    },
    `gatsby-transformer-remark`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Launch Portal`,
        short_name: `LaunchPortal`,
        start_url: `/`,
        background_color: `#000000`,
        theme_color: `#000000`,
        display: `minimal-ui`,
        icon: `src/images/gatsby-icon.png`, // Ensure this path is correct.
      },
    },
    // Add other plugins here as needed.
  ],
};

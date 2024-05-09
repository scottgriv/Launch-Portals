const path = require("path");

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;
  const result = await graphql(`
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
              custom
              vportals
              hportals
            }
            id
          }
        }
      }
    }
  `);

  if (result.errors) {
    throw result.errors;
  }

  // Define a template for your portals.
  const portalTemplate = path.resolve(`./src/templates/portalTemplate.js`);

  // Iterate through each node to create pages.
  result.data.allMarkdownRemark.edges.forEach((edge, index) => {
    // Use the node's order and ID to create a more generic path if name is not available.
    // Alternatively, consider generating a slug or ID from the URL or another unique piece of data.
    const path = `/portal/${edge.node.frontmatter.order}-${edge.node.id}`;

    createPage({
      path: path,
      component: portalTemplate,
      context: {
        id: edge.node.id,
      },
    });
  });
};

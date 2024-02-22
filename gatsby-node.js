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

  // Define a template for your cards.
  const cardTemplate = path.resolve(`./src/templates/cardTemplate.js`);

  // Iterate through each node to create pages.
  result.data.allMarkdownRemark.edges.forEach((edge, index) => {
    // Use the node's order and ID to create a more generic path if name is not available.
    // Alternatively, consider generating a slug or ID from the URL or another unique piece of data.
    const path = `/card/${edge.node.frontmatter.order}-${edge.node.id}`;

    createPage({
      path: path,
      component: cardTemplate,
      context: {
        id: edge.node.id,
      },
    });
  });
};

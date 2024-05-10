const path = require("path");

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;
  const result = await graphql(`
    query {
      allMarkdownRemark(sort: {frontmatter: {order: ASC}}) {
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

// This function is responsible for customizing the GraphQL schema
exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;
  const typeDefs = `
    type MarkdownRemarkFrontmatter {
      type: String
      order: Int
      text: String
      markdown: String
      photo: String
      file: String
      fileTitle : String
      link: String
      custom: String
      vportals: Int
      hportals: Int
    }

    type MarkdownRemark implements Node {
      frontmatter: MarkdownRemarkFrontmatter
    }
  `;
  createTypes(typeDefs);
};

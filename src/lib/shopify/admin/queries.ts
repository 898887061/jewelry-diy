export const ADMIN_GET_BEADS = `
  query AdminGetBeads($first: Int!, $after: String) {
    products(first: $first, after: $after, query: "tag:bracelet-bead") {
      edges {
        node {
          id
          title
          handle
          status
          tags
          featuredImage {
            url
            altText
          }
          metafields(first: 10) {
            edges {
              node {
                namespace
                key
                value
              }
            }
          }
          variants(first: 20) {
            edges {
              node {
                id
                title
                price
                inventoryQuantity
              }
            }
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

export const ADMIN_GET_BEAD_BY_ID = `
  query AdminGetBeadById($id: ID!) {
    product(id: $id) {
      id
      title
      handle
      status
      tags
      featuredImage {
        url
        altText
      }
      metafields(first: 10) {
        edges {
          node {
            namespace
            key
            value
          }
        }
      }
      variants(first: 20) {
        edges {
          node {
            id
            title
            price
            inventoryQuantity
          }
        }
      }
    }
  }
`;

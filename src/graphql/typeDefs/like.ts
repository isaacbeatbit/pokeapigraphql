export const likeTypeDefs = /* GraphQL */ `
  type Like {
    id: ID!
    name: String!
    stars: Int!
  }

  type Mutation {
    doLike(name: String!): Boolean!
  }

  type Subscription {
    likeCount(name: String!): Like
  }
`

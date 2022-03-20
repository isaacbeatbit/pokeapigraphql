export const pokemonTypeDefs = /* GraphQL */ `
  type Ability {
    name: String
  }

  type PokemonType {
    name: String
  }

  type Pokemon {
    id: ID
    abilities: [Ability!]!
    name: String
    image: String
    types: [PokemonType!]!
    stars: Int!
  }

  input PokemonsInput {
    limit: Int!
    offset: Int!
  }

  type Query {
    pokemons(input: PokemonsInput!): [Pokemon!]
  }
`

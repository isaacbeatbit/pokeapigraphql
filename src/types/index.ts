export type Query = {
  limit: number
  offset: number
}

type Ability = {
  name: string
}

type PokemonType = {
  name: string
}

export type TPokemon = {
  abilities: Ability[]
  id: string
  name: string
  image: string
  types: PokemonType[]
}

export type PokemonWithStars = TPokemon & {
  stars: number
}

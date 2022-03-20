import { getPokemons } from '../../lib/pokemons/getPokemons'
import { PokemonWithStars, Query } from '../../types'

export default {
  Query: {
    async pokemons(
      _parent: any,
      { input }: { input: Query }
    ): Promise<PokemonWithStars[]> {
      const pokemons = await getPokemons({
        limit: input.limit,
        offset: input.offset
      })

      return pokemons
    }
  }
}

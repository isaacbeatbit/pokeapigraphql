import { PokemonWithStars, Query } from '../../types'
import fetch from 'cross-fetch'
import { PrismaClient } from '@prisma/client'

const options = {
  method: 'GET',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json;charset=UTF-8'
  }
}

type Ability = {
  ability: {
    name: string
  }
}
type PokemonType = {
  type: {
    name: string
  }
}

const prisma = new PrismaClient()

export async function getPokemons({
  limit,
  offset
}: Query): Promise<PokemonWithStars[]> {
  const url = `https://pokeapi.co/api/v2/pokemon/?limit=${limit}&offset=${offset}`

  const res = await fetch(url, options)

  const pokemonsUrl = await res.json()

  const { results } = pokemonsUrl

  const pokemonsPromises = results.map(async ({ url }: { url: string }) => {
    const singlePokemonRes = await fetch(url, options)
    const singlePokemon = await singlePokemonRes.json()
    const {
      abilities: abilitiesNested,
      id,
      name,
      sprites: {
        other: {
          'official-artwork': { front_default: frontDefault }
        }
      },
      types: typesNested
    } = singlePokemon

    const item = await prisma.like.findUnique({ where: { name } })

    const stars = item ? item.stars : 0

    const abilities = abilitiesNested.map(({ ability: { name } }: Ability) => ({
      name
    }))

    const types = typesNested.map(({ type: { name } }: PokemonType) => ({
      name
    }))

    return {
      abilities,
      id,
      name,
      image: frontDefault,
      types,
      stars
    }
  })

  const pokemons: PokemonWithStars[] = await Promise.all(pokemonsPromises)

  return pokemons
}

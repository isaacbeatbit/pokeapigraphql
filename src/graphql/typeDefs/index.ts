import { mergeTypeDefs } from '@graphql-tools/merge'
import { likeTypeDefs } from './like'
import { pokemonTypeDefs } from './pokemon'

const typeDefs = mergeTypeDefs([likeTypeDefs, pokemonTypeDefs])

export default typeDefs

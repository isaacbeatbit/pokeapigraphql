import { PrismaClient } from '@prisma/client'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { makeExecutableSchema } from '@graphql-tools/schema'
import typeDefs from './graphql/typeDefs'
import { createServer } from 'http'
import resolvers from './graphql/resolvers'
import { WebSocketServer } from 'ws'
import { useServer } from 'graphql-ws/lib/use/ws'
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

const PORT = process.env.PORT || 4000

interface iContext {
  prisma: PrismaClient
}

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

async function main() {
  const app = express()

  const httpServer = createServer(app)

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/subscriptions'
  })

  const serverCleanup = useServer({ schema }, wsServer)

  const server = new ApolloServer({
    schema,
    context: async (): Promise<iContext> => {
      return {
        prisma
      }
    },
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose()
            }
          }
        }
      }
    ]
  })

  await server.start()

  server.applyMiddleware({ app, path: '/' })

  // app.listen({ port: PORT }, () => {
  //   console.log(
  //     `🚀 Server ready in http://localhost:${PORT}${server.graphqlPath}`
  //   )
  // })

  httpServer.listen(PORT, () => {
    console.log(
      `Server is now running on http://localhost:${PORT}${server.graphqlPath}`
    )
  })
}

main()
  .catch(e => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

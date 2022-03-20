import { PrismaClient } from '@prisma/client'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { makeExecutableSchema } from '@graphql-tools/schema'
import typeDefs from './graphql/typeDefs'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import { useServer } from 'graphql-ws/lib/use/ws'
import resolvers from './graphql/resolvers'
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core'

const prisma = new PrismaClient()

const PORT = 4000

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
    server: httpServer
    // path: '/'
  })

  const serverCleanup = useServer({ schema }, wsServer)

  // app.use(
  //   cors({
  //     credentials: true,
  //     origin: ['http://localhost:3000', 'https://studio.apollographql.com']
  //   })
  // )

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

  server.applyMiddleware({ app })
  // server.applyMiddleware({ app, path: '/', cors: false })

  // app.listen({ port: PORT }, () => {
  //   console.log(`🚀 Server ready in http://localhost:${PORT}`)
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

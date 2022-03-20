import { PrismaClient, Like } from '@prisma/client'
import { PubSub, withFilter } from 'graphql-subscriptions'

const prisma = new PrismaClient()

const pubsub = new PubSub()

function publishLike({ like }: { like: Like }): void {
  pubsub.publish('likeCount', {
    likeCount: like
  })
}

export default {
  Mutation: {
    async doLike(_parent: any, { name }: { name: string }): Promise<boolean> {
      const likeExists = await prisma.like.findUnique({ where: { name } })

      if (likeExists) {
        const stars = likeExists.stars + 1

        const likeUpdated = await prisma.like.update({
          where: { name },
          data: {
            stars
          }
        })

        publishLike({ like: likeUpdated })
      } else {
        const like = await prisma.like.upsert({
          where: { name },
          create: {
            name,
            stars: 1
          },
          update: {}
        })

        publishLike({ like })
      }

      await prisma.$disconnect()

      return true
    }
  },
  Subscription: {
    likeCount: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('likeCount'),
        (payload, variables) => {
          return payload.likeCount.name === variables.name
        }
      )
    }
  }
}

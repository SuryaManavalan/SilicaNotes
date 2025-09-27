import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { SingleStorePrismaAdapter } from "@/lib/singlestore-adapter"
import { prisma } from "@/lib/database"

export const authOptions = {
  adapter: SingleStorePrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    session: ({ session, user }: any) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
}

export default NextAuth(authOptions)
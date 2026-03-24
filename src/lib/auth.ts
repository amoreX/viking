import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { PrismaAdapter } from "@auth/prisma-adapter"
import db from "@/lib/db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    GitHub({
      authorization: { params: { scope: "read:user repo" } },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id

        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { githubUsername: true },
        })

        if (dbUser?.githubUsername) {
          (session.user as any).githubUsername = dbUser.githubUsername
        }
      }
      return session
    },

    async signIn({ user, account, profile }) {
      if (account?.provider === "github" && profile) {
        await db.user.update({
          where: { id: user.id! },
          data: {
            githubId: Number(profile.id),
            githubUsername: (profile as { login?: string }).login ?? null,
            bio: (profile as { bio?: string }).bio ?? null,
            avatarUrl: profile.avatar_url as string | undefined,
            githubAccessToken: account.access_token,
          },
        })
      }
      return true
    },
  },

  events: {
    async signIn({ user }) {
      // TODO: trigger initial repo sync for new users
      // e.g. await syncUserRepos(user.id)
    },
  },
})

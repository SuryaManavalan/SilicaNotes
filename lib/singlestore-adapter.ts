import { PrismaClient } from "@prisma/client";
import type { Adapter, AdapterUser, AdapterAccount, AdapterSession, VerificationToken } from "next-auth/adapters";

export function SingleStorePrismaAdapter(prisma: PrismaClient): Adapter {
  return {
    async createUser(user: Omit<AdapterUser, "id">): Promise<AdapterUser> {
      const created = await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
        },
      });
      return {
        id: created.id,
        name: created.name,
        email: created.email!,
        emailVerified: created.emailVerified,
        image: created.image,
      };
    },
    async getUser(id: string): Promise<AdapterUser | null> {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user || !user.email) return null;
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
      };
    },
    async getUserByEmail(email: string): Promise<AdapterUser | null> {
      // Use findFirst since we can't enforce unique constraint
      const user = await prisma.user.findFirst({ where: { email } });
      if (!user || !user.email) return null;
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
      };
    },
    async getUserByAccount({ providerAccountId, provider }): Promise<AdapterUser | null> {
      const account = await prisma.account.findFirst({
        where: { providerAccountId, provider },
        include: { user: true },
      });
      if (!account?.user || !account.user.email) return null;
      return {
        id: account.user.id,
        name: account.user.name,
        email: account.user.email,
        emailVerified: account.user.emailVerified,
        image: account.user.image,
      };
    },
    async updateUser({ id, ...data }): Promise<AdapterUser> {
      const updated = await prisma.user.update({ where: { id }, data });
      return {
        id: updated.id,
        name: updated.name,
        email: updated.email!,
        emailVerified: updated.emailVerified,
        image: updated.image,
      };
    },
    async deleteUser(userId: string): Promise<void> {
      await prisma.user.delete({ where: { id: userId } });
    },
    async linkAccount(account: AdapterAccount): Promise<void> {
      await prisma.account.create({ data: account as any });
    },
    async unlinkAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }): Promise<void> {
      await prisma.account.deleteMany({
        where: {
          provider,
          providerAccountId,
        },
      });
    },
    async createSession({ sessionToken, userId, expires }): Promise<AdapterSession> {
      const session = await prisma.session.create({
        data: { sessionToken, userId, expires },
      });
      return {
        sessionToken: session.sessionToken,
        userId: session.userId,
        expires: session.expires,
      };
    },
    async getSessionAndUser(sessionToken: string): Promise<{ session: AdapterSession; user: AdapterUser; } | null> {
      const userAndSession = await prisma.session.findFirst({
        where: { sessionToken },
        include: { user: true },
      });
      if (!userAndSession || !userAndSession.user.email) return null;
      const { user, ...session } = userAndSession;
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email!,
          emailVerified: user.emailVerified,
          image: user.image,
        },
        session: {
          sessionToken: session.sessionToken,
          userId: session.userId,
          expires: session.expires,
        },
      };
    },
    async updateSession({ sessionToken, ...data }): Promise<AdapterSession | null | undefined> {
      try {
        const session = await prisma.session.findFirst({
          where: { sessionToken },
        });
        if (!session) return null;
        
        const updated = await prisma.session.update({
          where: { id: session.id },
          data,
        });
        return {
          sessionToken: updated.sessionToken,
          userId: updated.userId,
          expires: updated.expires,
        };
      } catch (error) {
        return null;
      }
    },
    async deleteSession(sessionToken: string): Promise<void> {
      const session = await prisma.session.findFirst({
        where: { sessionToken },
      });
      if (session) {
        await prisma.session.delete({ where: { id: session.id } });
      }
    },
    async createVerificationToken({ identifier, expires, token }): Promise<VerificationToken> {
      const verificationToken = await prisma.verificationToken.create({
        data: { identifier, expires, token },
      });
      return {
        identifier: verificationToken.identifier,
        expires: verificationToken.expires,
        token: verificationToken.token,
      };
    },
    async useVerificationToken({ identifier, token }): Promise<VerificationToken | null> {
      try {
        const verificationToken = await prisma.verificationToken.findFirst({
          where: { identifier, token },
        });
        if (!verificationToken) return null;
        
        // Delete by finding the record first since we can't use unique constraints
        await prisma.verificationToken.deleteMany({
          where: { identifier, token },
        });
        return {
          identifier: verificationToken.identifier,
          expires: verificationToken.expires,
          token: verificationToken.token,
        };
      } catch (error) {
        return null;
      }
    },
  };
}
import { PrismaClient } from '@prisma/client';

/**
 * Create a new user session
 */
export const createUserSession = async (
  prisma: PrismaClient,
  userId: number,
  ipAddress?: string,
  userAgent?: string,
  deviceName?: string,
): Promise<string> => {
  const session = await prisma.session.create({
    data: {
      userId,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      ipAddress,
      userAgent,
      deviceName,
    },
  });
  
  return session.id;
};

/**
 * Get active user sessions count
 */
export const getUserSessionsCount = async (
  prisma: PrismaClient,
  userId: number,
): Promise<number> => {
  return await prisma.session.count({
    where: {
      userId,
      expires: {
        gt: new Date(),
      },
    },
  });
};

/**
 * Invalidate a user session
 */
export const invalidateUserSession = async (
  prisma: PrismaClient,
  sessionId: string,
): Promise<void> => {
  await prisma.session.update({
    where: { id: sessionId },
    data: { expires: new Date() },
  });
};

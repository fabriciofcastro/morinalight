import { getPrisma } from "../../infra/database/prisma.service";

const prisma = getPrisma();


export class CommentsService {
  async createComment(requestId: string, authorId: string, content: string) {
    return prisma.approvalRequestComment.create({
      data: {
        requestId,
        authorId,
        content,
      },
      include: {
        author: {
          select: {
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async getComments(requestId: string) {
    return prisma.approvalRequestComment.findMany({
      where: { requestId },
      orderBy: { createdAt: "asc" },
      include: {
        author: {
          select: {
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }
}

export const commentsService = new CommentsService();

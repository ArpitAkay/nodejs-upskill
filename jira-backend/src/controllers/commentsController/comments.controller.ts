import { Request, Response } from "express";
import prismaClient from "../../configs/prismaClient.config";
import { v4 as uuidv4 } from "uuid";
import { minioClient } from "../../configs/minio.config";
import { MINIO_ATTACHMENTS_BUCKET_NAME } from "../../configs/env.config";
import {
  extractUserEmailFromJwtToken,
  verifyJwtToken,
} from "../../util/jwt.util";
import {
  generatePreSignedUrl,
  uploadImageToMinio,
} from "../../util/minio.util";

export const createCommentAndAssignToTask = async (
  req: Request,
  res: Response
) => {
  try {
    const files = req.files as Express.Multer.File[];
    console.log(files);
    const commentData = JSON.parse(req.body.commentData);

    const { taskId, content }: { taskId: number; content: string } =
      commentData;
    console.log(content);

    const { id }: { id: number } = await extractUserEmailFromJwtToken(req, res);

    const isUserExists = await prismaClient.users.findUnique({
      where: {
        id: id,
      },
    });

    if (!isUserExists) {
      return res.status(400).json({ message: "User not found" });
    }

    const isTaskExists = await prismaClient.tasks.findUnique({
      where: {
        id: taskId,
      },
    });

    if (!isTaskExists) {
      return res.status(400).json({ message: "Task not found" });
    }

    const commentInserted = await prismaClient.comments.create({
      data: {
        content: content,
        task_id: isTaskExists.id,
        commented_by: isUserExists.id,
      },
    });

    if (files && files.length !== 0) {
      for (const file of files) {
        const objectName = `task-${isTaskExists.id}/comment-${
          commentInserted.id
        }/${uuidv4()}-${file.originalname}`;

        let presignedUrl: string = "";
        try {
          await uploadImageToMinio(
            MINIO_ATTACHMENTS_BUCKET_NAME,
            objectName,
            file
          );
          presignedUrl = await generatePreSignedUrl(
            MINIO_ATTACHMENTS_BUCKET_NAME,
            objectName,
            7
          );
        } catch (error: any) {
          console.log(error);
        }
        const attachmentInserted = await prismaClient.attachments.create({
          data: {
            url: presignedUrl,
            image_name: objectName,
            url_expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            comment_id: commentInserted.id,
            uploaded_by: isUserExists.id,
          },
        });
      }
    }

    const commentSaved = await prismaClient.comments.findUnique({
      where: {
        id: commentInserted.id,
      },
      select: {
        id: true,
        content: true,
        created_at: true,
        task: {
          select: {
            id: true,
            title: true,
            description: true,
            workflow: {
              select: {
                name: true,
              },
            },
            created_at: true,
            creator: {
              select: {
                id: true,
                name: true,
                profile_url: true,
                email: true,
              },
            },
            assignee: {
              select: {
                id: true,
                name: true,
                profile_url: true,
                email: true,
              },
            },
            project: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        commented_by_user: {
          select: {
            id: true,
            name: true,
            profile_url: true,
            email: true,
          },
        },
        attachments: {
          select: {
            id: true,
            url: true,
            uploaded_by: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: "Comment created",
      comment: commentSaved,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(400).json({ message: "Internal server error" });
  }
};

export const editComment = async (req: Request, res: Response) => {
  try {
    const { content }: { content: string } = req.body;
    const commentId = req.params.commentId;
    const email = req.body.userData.email;

    const isUserExists = await prismaClient.users.findUnique({
      where: {
        email: email,
      },
    });

    if (!isUserExists) {
      return res.status(400).json({ message: "User not found" });
    }

    const isCommentExists = await prismaClient.comments.findUnique({
      where: {
        id: parseInt(commentId),
      },
    });

    if (!isCommentExists) {
      return res.status(400).json({ message: "Comment not found" });
    }

    if (isUserExists.id !== isCommentExists.commented_by) {
      return res
        .status(400)
        .json({ message: "You are not allowed to edit this comment" });
    }

    const commentUpdated = await prismaClient.comments.update({
      where: {
        id: parseInt(commentId),
      },
      data: {
        content: content,
      },
      select: {
        id: true,
        content: true,
        created_at: true,
        commented_by_user: {
          select: {
            id: true,
            name: true,
            profile_url: true,
            email: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: "Comment updated",
      comment: commentUpdated,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(400).json({ message: "Internal server error" });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const email = req.body.userData.email;

    const isUserExists = await prismaClient.users.findUnique({
      where: {
        email: email,
      },
    });

    if (!isUserExists) {
      return res.status(400).json({ message: "User not found" });
    }

    const commentId = req.params.commentId;

    const isCommentExists = await prismaClient.comments.findUnique({
      where: {
        id: parseInt(commentId),
      },
    });

    if (!isCommentExists) {
      return res.status(400).json({ message: "Comment not found" });
    }

    if (isUserExists.id !== isCommentExists.commented_by) {
      return res
        .status(400)
        .json({ message: "You are not allowed to delete this comment" });
    }

    await prismaClient.attachments.deleteMany({
      where: {
        comment_id: parseInt(commentId),
      },
    });

    await prismaClient.comments.delete({
      where: {
        id: parseInt(commentId),
      },
    });

    return res.status(200).json({
      message: "Comment deleted",
    });
  } catch (error: any) {
    console.log(error);
    return res.status(400).json({ message: "Internal server error" });
  }
};

export const getAllCommentsOfTask = async (req: Request, res: Response) => {
  try {
    const taskId = req.params.taskId;

    const isTaskExists = await prismaClient.tasks.findUnique({
      where: {
        id: parseInt(taskId),
      },
    });

    if (!isTaskExists) {
      return res.status(400).json({ message: "Task not found" });
    }

    const comments = await prismaClient.comments.findMany({
      where: {
        task_id: parseInt(taskId),
      },
      orderBy: [
        {
          created_at: "desc",
        },
      ],
      select: {
        id: true,
        content: true,
        created_at: true,
        task: {
          select: {
            id: true,
            title: true,
            description: true,
            workflow: {
              select: {
                name: true,
              },
            },
            created_at: true,
            creator: {
              select: {
                id: true,
                name: true,
                profile_url: true,
                email: true,
              },
            },
            assignee: {
              select: {
                id: true,
                name: true,
                profile_url: true,
                email: true,
              },
            },
          },
        },
        commented_by_user: {
          select: {
            id: true,
            name: true,
            profile_url: true,
            email: true,
          },
        },
        attachments: {
          select: {
            id: true,
            url: true,
          },
        },
      },
    });

    if (comments && comments.length === 0) {
      return res.status(200).json({
        message: "No comments found",
      });
    }

    return res.status(200).json({
      comments,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(400).json({ message: "Internal server error" });
  }
};

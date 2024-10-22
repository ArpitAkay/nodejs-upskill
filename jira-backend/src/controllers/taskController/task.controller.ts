import { Request, Response } from "express";
import prismaClient from "../../configs/prismaClient.config";

export const createTaskAndAssignToProject = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      assigneeId,
      projectId,
      title,
      description,
    }: {
      assigneeId: number | undefined | null;
      projectId: number;
      title: string;
      description: string;
    } = req.body;
    const { email }: { email: string } = req.body.userData;

    const isCreatedByExists = await prismaClient.users.findUnique({
      where: {
        email: email,
      },
    });

    if (!isCreatedByExists) {
      return res.status(404).json({ message: "User not found" });
    }

    let isAssigneeExists;
    if (assigneeId) {
      isAssigneeExists = await prismaClient.users.findUnique({
        where: {
          id: assigneeId,
        },
      });

      if (!isAssigneeExists) {
        return res.status(404).json({ message: "Assignee not found" });
      }
    }

    const isProjectExists = await prismaClient.projects.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!isProjectExists) {
      return res.status(404).json({ message: "Project not found" });
    }

    const projectWorkflows = await prismaClient.projectHasWorkflow.findMany({
      where: {
        project_id: projectId,
      },
      select: {
        workflow: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (projectWorkflows.length === 0) {
      return res
        .status(404)
        .json({ message: "Please create workflows for project" });
    }

    const firstProjectWorkflow = projectWorkflows[0];
    const taskInserted = await prismaClient.tasks.create({
      data: {
        title: title,
        description: description,
        status: firstProjectWorkflow.workflow.id,
        assignee_id: isAssigneeExists ? isAssigneeExists.id : null,
        created_by: isCreatedByExists.id,
        project_id: isProjectExists.id,
      },
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
            email: true,
            profile_url: true,
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
    });

    return res.status(200).json({
      message: "Task created",
      task: taskInserted,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export const getTaskInfo = async (req: Request, res: Response) => {
  try {
    const taskId = req.params.taskId;

    const isTaskExists = await prismaClient.tasks.findUnique({
      where: {
        id: parseInt(taskId),
      },
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
    });

    if (!isTaskExists) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.status(200).json({
      message: "Task data fetched successfully",
      task: isTaskExists,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export const getAllTasksOfProject = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 0;
    const pageSize = Number(req.query.pageSize) || 10;
    const projectId = req.params.projectId;
    const status: string = req.query.status as string;
    const createdAt: string = req.query.createdAt as string;
    const createdBy: string = req.query.createdBy as string;
    const assignedTo: string = req.query.assignedTo as string;

    const isProjectExists = await prismaClient.projects.findUnique({
      where: {
        id: parseInt(projectId),
      },
    });

    if (!isProjectExists) {
      return res.status(404).json({ message: "Project not found" });
    }

    const filters: {
      project_id: number;
      status?: number;
      created_at?: {
        gte: Date;
        lt: Date;
      };
      created_by?: number;
      assignee_id?: number;
    } = {
      project_id: isProjectExists.id,
    };

    if (createdAt) {
      const startDate = new Date(createdAt);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      filters.created_at = {
        gte: startDate,
        lt: endDate,
      };
    }

    if (createdBy) {
      filters.created_by = parseInt(createdBy);
    }

    if (assignedTo) {
      filters.assignee_id = parseInt(assignedTo);
    }

    const isWorkflowExists = await prismaClient.workflows.findUnique({
      where: {
        name: status,
      },
    });

    if (!isWorkflowExists) {
      return res.status(404).json({ message: "Workflow not found" });
    }

    if (status) {
      filters.status = isWorkflowExists.id;
    }

    const tasks = await prismaClient.tasks.findMany({
      where: filters,
      skip: page * pageSize,
      take: pageSize,
      orderBy: [
        {
          created_at: "desc",
        },
      ],
      select: {
        id: true,
        title: true,
        description: true,
        workflow: {
          select: {
            id: true,
            name: true,
          },
        },
        created_at: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            profile_url: true,
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
          },
        },
      },
    });

    const countOfAllTasksOfProjects = await prismaClient.tasks.count({
      where: {
        project_id: parseInt(projectId),
      },
    });

    return res.status(200).json({
      tasks: tasks,
      totalPages: Math.ceil(countOfAllTasksOfProjects / pageSize),
      totalResults: countOfAllTasksOfProjects,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export const searchTasksInProject = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.projectId;
    const searchQuery: string = req.query.search as string;

    const isProjectExists = await prismaClient.projects.findUnique({
      where: {
        id: parseInt(projectId),
      },
    });

    if (!isProjectExists) {
      return res.status(404).json({ message: "Project not found" });
    }

    const tasks = await prismaClient.tasks.findMany({
      where: {
        project_id: parseInt(projectId),
        OR: [
          {
            title: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
        ],
      },
      include: {
        workflow: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            profile_url: true,
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
          },
        },
      },
    });

    return res.status(200).json({
      tasks: tasks,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

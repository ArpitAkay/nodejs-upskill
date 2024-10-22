import { Request, Response } from "express";
import prismaClient from "../../configs/prismaClient.config";
import { projectMiddleware } from "../../middleware/projectMiddleware";
import { USER_ROLE_IN_PROJECT } from "../../types/user_role/userRoleInProject";

export const createProject = async (req: Request, res: Response) => {
  try {
    const { email }: { email: string } = req.body.userData.data;
    const {
      name,
      description,
      workflows,
    }: { name: string; description: string; workflows: string[] } = req.body;

    const isUserExists = await prismaClient.users.findUnique({
      where: {
        email: email,
      },
    });

    if (!isUserExists) {
      return res.status(400).json({ message: "User not found" });
    }

    const isProjectExists = await prismaClient.projects.findUnique({
      where: {
        name: name,
      },
    });

    if (isProjectExists) {
      return res.status(400).json({ message: "Project already exists" });
    }

    const project = await prismaClient.projects.create({
      data: {
        name: name,
        description: description,
        owner_id: isUserExists.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        owner: {
          select: {
            id: true,
            name: true,
            profile_url: true,
            email: true,
          },
        },
      },
    });

    const projectMember = await prismaClient.projectMembers.create({
      data: {
        user_id: isUserExists.id,
        project_id: project.id,
        user_role: "OWNER",
      },
    });

    for (const workflow of workflows) {
      let isWorkflowExists = await prismaClient.workflows.findUnique({
        where: {
          name: workflow,
        },
      });

      if (!isWorkflowExists) {
        isWorkflowExists = await prismaClient.workflows.create({
          data: {
            name: workflow,
          },
        });
      }

      await prismaClient.projectHasWorkflow.create({
        data: {
          project_id: project.id,
          workflow_id: isWorkflowExists.id,
        },
      });
    }

    return res.status(201).json({
      message: "Project created successfully",
      project: project,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const { email }: { email: string } = req.body.userData.data;
    const { name, description } = req.body;
    const projectId = req.params.projectId;

    const isUserExists = await prismaClient.users.findUnique({
      where: {
        email: email,
      },
    });

    if (!isUserExists) {
      return res.status(400).json({ message: "User not found" });
    }

    const isProjectExists = await prismaClient.projects.findUnique({
      where: {
        id: parseInt(projectId),
      },
    });

    if (!isProjectExists) {
      return res.status(400).json({ message: "Project not found" });
    }

    if (isProjectExists.owner_id !== isUserExists.id) {
      return res.status(403).json({
        message: "You are not allowed to update project info",
      });
    }

    const project = await prismaClient.projects.update({
      where: {
        id: parseInt(projectId),
      },
      data: {
        name: name,
        description: description,
      },
      select: {
        id: true,
        name: true,
        description: true,
        owner: {
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
      message: "Project updated successfully",
      project: project,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const addUserToProject = async (req: Request, res: Response) => {
  try {
    const { userId, projectId, userRole } = req.body;
    const { id: ownerId }: { id: number } = req.body.userData.data;
    const isUserToBeAddedExists = await prismaClient.users.findUnique({
      where: {
        id: userId,
      },
    });

    const isProjectExists = await prismaClient.projects.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!isUserToBeAddedExists || !isProjectExists) {
      return res.status(400).json({ message: "User or project not found" });
    }

    const hasRole = await projectMiddleware(
      isProjectExists.id,
      ownerId,
      USER_ROLE_IN_PROJECT.OWNER
    );

    if (!hasRole) {
      return res.status(403).json({
        message: "You are not the owner of the project",
      });
    }

    const isUserAlreadyInProject = await prismaClient.projectMembers.findFirst({
      where: {
        user_id: isUserToBeAddedExists.id,
        project_id: isProjectExists.id,
      },
    });

    if (isUserAlreadyInProject) {
      return res.status(400).json({ message: "User already in project" });
    }
    const projectMember = await prismaClient.projectMembers.create({
      data: {
        user_id: isUserToBeAddedExists.id,
        project_id: isProjectExists.id,
        user_role: userRole,
      },
    });
    return res.status(200).json({ message: "User added to project" });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllUsersOfProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const project = await prismaClient.projects.findUnique({
      where: {
        id: parseInt(projectId),
      },
    });

    if (!project) {
      return res.status(400).json({ message: "Project not found" });
    }

    const projectMembers = await prismaClient.projectMembers.findMany({
      where: {
        project_id: parseInt(projectId),
      },
      select: {
        user_role: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile_url: true,
          },
        },
      },
    });

    if (projectMembers.length === 0) {
      return res.status(404).json({ message: "No members found" });
    }
    return res.status(200).json({
      message: "Project members fetched successfully",
      projectMembers: projectMembers,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyProjects = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 0;
    const pageSize = Number(req.query.pageSize) || 10;
    const { email }: { email: string } = req.body.userData.data;

    const isUserExists = await prismaClient.users.findUnique({
      where: {
        email: email,
      },
    });

    if (!isUserExists) {
      return res.status(400).json({ message: "User not found" });
    }

    const projects = await prismaClient.projects.findMany({
      where: {
        owner_id: isUserExists.id,
      },
      skip: page * pageSize,
      take: pageSize,
      orderBy: {
        created_at: "desc",
      },
      select: {
        id: true,
        name: true,
        description: true,
        created_at: true,
        owner: {
          select: {
            id: true,
            name: true,
            profile_url: true,
            email: true,
          },
        },
      },
    });

    const allMyProjects = await prismaClient.projects.count({
      where: {
        owner_id: isUserExists.id,
      },
    });

    if (projects.length === 0) {
      return res.status(404).json({ message: "No projects found" });
    }

    return res.status(200).json({
      message: "Projects fetched successfully",
      projects: projects,
      totalPages: Math.ceil(allMyProjects / pageSize),
      totalResults: allMyProjects,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 0;
    const pageSize = Number(req.query.pageSize) || 10;
    const projects = await prismaClient.projects.findMany({
      skip: page * pageSize,
      take: pageSize,
      orderBy: {
        created_at: "desc",
      },
      select: {
        id: true,
        name: true,
        description: true,
        created_at: false,
        updated_at: false,
        deleted_at: false,
        owner: {
          select: {
            id: true,
            name: true,
            profile_url: true,
            email: true,
          },
        },
      },
    });

    if (projects.length === 0) {
      return res.status(404).json({ message: "No projects found" });
    }

    const allProjects = await prismaClient.projects.count();

    return res.status(200).json({
      message: "Projects fetched successfully",
      projects: projects,
      totalPages: Math.ceil(allProjects / pageSize),
      totalResults: allProjects,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const searchMyProjects = async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string;
    const { id } = req.body.userData.data;

    const isUserExists = await prismaClient.users.findUnique({
      where: {
        id: id,
      },
    });

    if (!isUserExists) {
      return res.status(404).json({ message: "User not found" });
    }

    const projects = await prismaClient.projects.findMany({
      where: {
        owner_id: isUserExists.id,
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      },
    });

    return res.status(200).json({
      projects: projects,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

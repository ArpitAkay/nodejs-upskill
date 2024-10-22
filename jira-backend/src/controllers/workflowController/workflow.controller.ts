import { Request, Response } from "express";
import prismaClient from "../../configs/prismaClient.config";
import { projectMiddleware } from "../../middleware/projectMiddleware";
import { USER_ROLE_IN_PROJECT } from "../../types/user_role/userRoleInProject";

export const createNewWorkflowAndAssignToProject = async (
  req: Request,
  res: Response
) => {
  try {
    const { projectId, workflows }: { projectId: number; workflows: string[] } =
      req.body;
    const { id } = req.body.userData.data;

    const isUserExists = await prismaClient.users.findUnique({
      where: {
        id: id,
      },
    });

    if (!isUserExists) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const isProjectExists = await prismaClient.projects.findUnique({
      where: {
        id: projectId,
      },
    });
    if (!isProjectExists) {
      return res.status(400).json({
        message: "Project not found",
      });
    }

    const hasRole = await projectMiddleware(
      isProjectExists.id,
      isUserExists.id,
      USER_ROLE_IN_PROJECT.OWNER
    );

    if (!hasRole) {
      return res.status(400).json({
        message: "User is not owner of the project",
      });
    }

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
          project_id: isProjectExists.id,
          workflow_id: isWorkflowExists.id,
        },
      });
    }
    return res.status(200).json({
      message: "Workflow created and assigned to project",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateWorkflow = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const workflowId = req.params.workflowId;

    const isWorkflowExists = await prismaClient.workflows.findUnique({
      where: {
        id: parseInt(workflowId),
      },
    });

    if (!isWorkflowExists) {
      return res.status(400).json({
        message: "Workflow not found",
      });
    }

    await prismaClient.workflows.update({
      where: {
        id: parseInt(workflowId),
      },
      data: {
        name: name,
      },
      select: {
        id: true,
        name: true,
      },
    });

    return res.status(200).json({
      message: "Workflow updated",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getWorkflowsOfProject = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.projectId;

    const isProjectExists = await prismaClient.projects.findUnique({
      where: {
        id: parseInt(projectId),
      },
    });
    if (!isProjectExists) {
      return res.status(400).json({
        message: "Project not found",
      });
    }

    const workflows = await prismaClient.projectHasWorkflow.findMany({
      where: {
        project_id: parseInt(projectId),
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

    return res.status(200).json({
      workflows: workflows,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

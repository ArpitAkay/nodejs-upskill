import { USER_ROLE_IN_PROJECT } from "../types/user_role/userRoleInProject";
import prismaClient from "../configs/prismaClient.config";

export const projectMiddleware = async (
  projectId: number,
  userId: number,
  userRoleInProject: USER_ROLE_IN_PROJECT
) => {
  const isProjectMembersExists = await prismaClient.projectMembers.findFirst({
    where: {
      project_id: projectId,
      user_id: userId,
    },
  });

  console.log(isProjectMembersExists);

  if (!isProjectMembersExists) {
    return false;
  }

  console.log(isProjectMembersExists.user_role === userRoleInProject);

  console.log(userRoleInProject);

  if (isProjectMembersExists.user_role === userRoleInProject) {
    return true;
  }
  return false;
};

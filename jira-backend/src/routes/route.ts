import { Router } from "express";
import {
  deleteUser,
  getAllUserInfos,
  getUserInfo,
  restoreUser,
  updateUserInfo,
} from "../controllers/usersController/users.controller";
import {
  ADD_USER_TO_PROJECT,
  API_PREFIX,
  ASSIGN_ROLE_TO_USER,
  COMMENT,
  CREATE_COMMENT_AND_ASSIGN_TO_TASK,
  CREATE_PERMISSION,
  CREATE_PROJECT,
  CREATE_ROLE,
  CREATE_TASK_AND_ASSIGN_TO_PROJECT,
  CREATE_WORKFLOW_AND_ASSIGN_TO_PROJECT,
  GET_ALL_COMMENTS_OF_TASK,
  GET_ALL_PERMISSIONS,
  GET_ALL_PROJECTS,
  GET_ALL_ROLES,
  GET_ALL_TASKS_OF_PROJECT,
  GET_ALL_USERS,
  GET_ALL_USERS_OF_PROJECT,
  GET_MY_PROJECTS,
  GET_TASK_INFO,
  GET_WORKFLOWS_OF_PROJECT,
  LOGIN,
  REGISTER,
  RENEW_ACCESS_TOKEN,
  RESTORE_USER,
  SEARCH_MY_PROJECTS,
  SEARCH_TASKS_IN_PROJECT,
  UPDATE_PERMISSION,
  UPDATE_PROJECT,
  UPDATE_ROLE,
  UPDATE_WORKFLOW,
  USER,
} from "../configs/endpoint.config";
import { validateJwtToken } from "../middleware/authMiddleware";
import {
  assignRoleToUser,
  createRoleAndAssignPermissions,
  getAllRoles,
  updateRoleWithPermissions,
} from "../controllers/rolesController/roles.controller";
import {
  createPermission,
  getAllPermissions,
  updatePermission,
} from "../controllers/permissionsController/permissions.controller";
import { validatePermissions } from "../middleware/permissionsMiddleware";
import { PERMISSION } from "../configs/permissions.config";
import {
  addUserToProject,
  createProject,
  getAllProjects,
  getAllUsersOfProject,
  getMyProjects,
  searchMyProjects,
  updateProject,
} from "../controllers/projectsController/projects.controller";
import {
  createNewWorkflowAndAssignToProject,
  getWorkflowsOfProject,
  updateWorkflow,
} from "../controllers/workflowController/workflow.controller";
import {
  createTaskAndAssignToProject,
  getAllTasksOfProject,
  getTaskInfo,
  searchTasksInProject,
} from "../controllers/taskController/task.controller";
import {
  createCommentAndAssignToTask,
  deleteComment,
  editComment,
  getAllCommentsOfTask,
} from "../controllers/commentsController/comments.controller";
import multer from "multer";
import {
  login,
  registerUser,
  renewAccessToken,
} from "../controllers/authController/auth.controller";

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 25, // 25mb
  },
});

const router = Router();

// Authentication - public
router.post(REGISTER, registerUser);
router.post(LOGIN, login);

// Renew Access Token
router.post(RENEW_ACCESS_TOKEN, renewAccessToken);

router.use(API_PREFIX, validateJwtToken);

// Users
router
  .route(USER)
  .get(validatePermissions(PERMISSION.GET_USER_INFO), getUserInfo)
  .patch(
    validatePermissions(PERMISSION.UPDATE_USER_INFO),
    upload.single("profile-image"),
    updateUserInfo
  )
  .delete(validatePermissions(PERMISSION.DELETE_USER), deleteUser);
router
  .route(GET_ALL_USERS)
  .get(validatePermissions(PERMISSION.GET_ALL_USERS), getAllUserInfos);
router
  .route(RESTORE_USER)
  .patch(validatePermissions(PERMISSION.RESTORE_USER), restoreUser);

// Roles
router
  .route(GET_ALL_ROLES)
  .get(validatePermissions(PERMISSION.GET_ALL_ROLES), getAllRoles);
router
  .route(CREATE_ROLE)
  .post(
    validatePermissions(PERMISSION.CREATE_ROLE),
    createRoleAndAssignPermissions
  );
router
  .route(ASSIGN_ROLE_TO_USER)
  .post(validatePermissions(PERMISSION.ASSIGN_ROLE_TO_USER), assignRoleToUser);
router
  .route(UPDATE_ROLE)
  .patch(
    validatePermissions(PERMISSION.UPDATE_ROLE_WITH_PERMISSIONS),
    updateRoleWithPermissions
  );

// Permissions
router
  .route(GET_ALL_PERMISSIONS)
  .get(validatePermissions(PERMISSION.GET_ALL_PERMISSIONS), getAllPermissions);
router
  .route(UPDATE_PERMISSION)
  .patch(validatePermissions(PERMISSION.UPDATE_PERMISSION), updatePermission);
router
  .route(CREATE_PERMISSION)
  .post(validatePermissions(PERMISSION.CREATE_PERMISSION), createPermission);

// Projects
router
  .route(GET_ALL_PROJECTS)
  .get(validatePermissions(PERMISSION.GET_ALL_PROJECTS), getAllProjects);
router
  .route(GET_MY_PROJECTS)
  .get(validatePermissions(PERMISSION.GET_MY_PROJECTS), getMyProjects);
router
  .route(GET_ALL_USERS_OF_PROJECT)
  .get(
    validatePermissions(PERMISSION.GET_ALL_USERS_OF_PROJECT),
    getAllUsersOfProject
  );
router
  .route(CREATE_PROJECT)
  .post(validatePermissions(PERMISSION.CREATE_PROJECT), createProject);
router
  .route(UPDATE_PROJECT)
  .patch(validatePermissions(PERMISSION.UPDATE_PROJECT), updateProject);
router
  .route(ADD_USER_TO_PROJECT)
  .post(validatePermissions(PERMISSION.ADD_USER_TO_PROJECT), addUserToProject);
router
  .route(SEARCH_MY_PROJECTS)
  .get(validatePermissions(PERMISSION.SEARCH_MY_PROJECTS), searchMyProjects);

// Tasks
router
  .route(CREATE_TASK_AND_ASSIGN_TO_PROJECT)
  .post(
    validatePermissions(PERMISSION.CREATE_TASK_AND_ASSIGN_TO_PROJECT),
    createTaskAndAssignToProject
  );
router
  .route(GET_TASK_INFO)
  .get(validatePermissions(PERMISSION.GET_TASK_INFO), getTaskInfo);
router
  .route(GET_ALL_TASKS_OF_PROJECT)
  .get(
    validatePermissions(PERMISSION.GET_ALL_TASKS_OF_PROJECT),
    getAllTasksOfProject
  );
router
  .route(SEARCH_TASKS_IN_PROJECT)
  .get(
    validatePermissions(PERMISSION.SEARCH_TASKS_IN_PROJECT),
    searchTasksInProject
  );

// Workflows
router
  .route(CREATE_WORKFLOW_AND_ASSIGN_TO_PROJECT)
  .post(
    validatePermissions(PERMISSION.CREATE_WORKFLOW_AND_ASSIGN_TO_PROJECT),
    createNewWorkflowAndAssignToProject
  );
router
  .route(UPDATE_WORKFLOW)
  .patch(validatePermissions(PERMISSION.UPDATE_WORKFLOW), updateWorkflow);
router
  .route(GET_WORKFLOWS_OF_PROJECT)
  .get(
    validatePermissions(PERMISSION.GET_WORKFLOWS_OF_PROJECT),
    getWorkflowsOfProject
  );

// Comments
router
  .route(CREATE_COMMENT_AND_ASSIGN_TO_TASK)
  .post(
    validatePermissions(PERMISSION.CREATE_COMMENT_AND_ASSIGN_TO_TASK),
    upload.array("attachments", 2),
    createCommentAndAssignToTask
  );
router
  .route(COMMENT)
  .patch(validatePermissions(PERMISSION.EDIT_COMMENT), editComment)
  .delete(validatePermissions(PERMISSION.DELETE_COMMENT), deleteComment);
router
  .route(GET_ALL_COMMENTS_OF_TASK)
  .get(
    validatePermissions(PERMISSION.GET_ALL_COMMENTS_OF_TASK),
    getAllCommentsOfTask
  );

export default router;

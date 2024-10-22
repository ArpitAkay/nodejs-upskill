export const API_PREFIX = "/api/*";

// Authentication
export const REGISTER = "/api/register";
export const LOGIN = "/api/login";

// Renew Access Token
export const RENEW_ACCESS_TOKEN = "/api/renew-access-token";

// Users
export const USER = "/api/user/:id";
export const GET_ALL_USERS = "/api/users";
export const RESTORE_USER = "/api/user/restore/:id";

// Roles
export const GET_ALL_ROLES = "/api/roles";
export const CREATE_ROLE = "/api/role/create";
export const ASSIGN_ROLE_TO_USER = "/api/role/assign";
export const UPDATE_ROLE = "/api/role/update/:roleId";

// Permissions
export const GET_ALL_PERMISSIONS = "/api/permissions";
export const UPDATE_PERMISSION = "/api/permission/update/:permissionId";
export const CREATE_PERMISSION = "/api/permission/create";

// Projects
export const GET_ALL_PROJECTS = "/api/projects";
export const GET_MY_PROJECTS = "/api/projects/owner";
export const GET_ALL_USERS_OF_PROJECT = "/api/project/users/:projectId";
export const CREATE_PROJECT = "/api/project/create";
export const UPDATE_PROJECT = "/api/project/update/:projectId";
export const ADD_USER_TO_PROJECT = "/api/project/add-user";
export const SEARCH_MY_PROJECTS = "/api/projects/search";

// Tasks
export const CREATE_TASK_AND_ASSIGN_TO_PROJECT = "/api/task/create";
export const GET_TASK_INFO = "/api/task/:taskId";
export const GET_ALL_TASKS_OF_PROJECT = "/api/tasks/project/:projectId";
export const SEARCH_TASKS_IN_PROJECT = "/api/tasks/project/search/:projectId";

// Workflows
export const CREATE_WORKFLOW_AND_ASSIGN_TO_PROJECT = "/api/workflow/create";
export const UPDATE_WORKFLOW = "/api/workflow/update/:workflowId";
export const GET_WORKFLOWS_OF_PROJECT = "/api/workflows/project/:projectId";

// Comments
export const COMMENT = "/api/comment/:commentId";
export const CREATE_COMMENT_AND_ASSIGN_TO_TASK = "/api/comment/create";
export const GET_ALL_COMMENTS_OF_TASK = "/api/comments/task/:taskId";

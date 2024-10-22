export enum PERMISSION {
  // Users
  GET_USER_INFO = "get-user-info",
  UPDATE_USER_INFO = "updateUserInfo",
  DELETE_USER = "delete-user",
  GET_ALL_USERS = "get-all-users",
  RESTORE_USER = "restore-user",

  // Roles
  GET_ALL_ROLES = "get-all-roles",
  CREATE_ROLE = "create-role",
  ASSIGN_ROLE_TO_USER = "assign-role-to-user",
  UPDATE_ROLE_WITH_PERMISSIONS = "update-role-with-permissions",

  // Permissions
  GET_ALL_PERMISSIONS = "get-all-permissions",
  UPDATE_PERMISSION = "update-permission",
  CREATE_PERMISSION = "create-permission",

  // Projects
  GET_ALL_PROJECTS = "get-all-projects",
  GET_MY_PROJECTS = "get-my-projects",
  GET_ALL_USERS_OF_PROJECT = "get-all-users-of-project",
  CREATE_PROJECT = "create-project",
  UPDATE_PROJECT = "update-project",
  ADD_USER_TO_PROJECT = "add-user-to-project",
  SEARCH_MY_PROJECTS = "search-my-projects",

  // Tasks
  CREATE_TASK_AND_ASSIGN_TO_PROJECT = "create-task-and-assign-to-project",
  GET_TASK_INFO = "get-task-info",
  GET_ALL_TASKS_OF_PROJECT = "get-all-tasks-of-project",
  SEARCH_TASKS_IN_PROJECT = "search-tasks-in-project",

  // Comments
  CREATE_COMMENT_AND_ASSIGN_TO_TASK = "create-comment-and-assign-to-task",
  EDIT_COMMENT = "edit-comment",
  DELETE_COMMENT = "delete-comment",
  GET_ALL_COMMENTS_OF_TASK = "get-all-comments-of-task",

  // Workflows
  CREATE_WORKFLOW_AND_ASSIGN_TO_PROJECT = "create-comment-and-assign-to-task",
  UPDATE_WORKFLOW = "update-workflow",
  GET_WORKFLOWS_OF_PROJECT = "get-workflows-of-project",
}

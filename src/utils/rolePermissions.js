export const ROLE_PERMISSIONS = {
  admin: {
    canBlockUser: true,
    canResetAttempts: true,
    canViewActivity: true,
    canManageExams: true,
    canManagePermissions: true,
  },

  moderator: {
    canBlockUser: true,
    canResetAttempts: false,
    canViewActivity: true,
    canManageExams: false,
    canManagePermissions: false,
  },

  analyst: {
    canBlockUser: false,
    canResetAttempts: false,
    canViewActivity: true,
    canManageExams: false,
    canManagePermissions: false,
  },

  custom: {}, // dynamic
};

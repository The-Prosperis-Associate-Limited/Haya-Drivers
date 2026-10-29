/*
  The query key IS the url - useGetData keys on it and useSubmitData refetches
  that key on success. A url built inline in a component invalidates nothing, so
  every endpoint the app calls belongs here.
*/
export const API_ENDPOINTS = {
  auth: {
    signup: "/auth/create-user",
    signin: "/auth/login",
    googleClient: "/auth/google/client",
    googleDriver: "/auth/google/driver",
    validateGoogleSession: (token: string) =>
      `/auth/google/callback/validate-session/${token}`,
    sendEmailOtp: "/auth/send-email-otp",
    verifyEmailOtp: "/auth/verify-email-otp",
    forgotPassword: "/auth/forgot-password",
    resetPassword: (token: string) => `/auth/reset-password?token=${token}`,
    updatePassword: "/auth/update-password",
    getProfile: "/auth/get-profile",
    updateProfile: "/auth/update-profile",
    reactivate: "/auth/reactivate",
    deactivate: "/auth/deactivate",
  },

  drivers: {
    search: (query: string) => `/client/drivers?${query}`,
    detail: (id: string) => `/client/drivers/${id}`,
    reviews: (id: string) => `/client/drivers/${id}/reviews`,
  },

  onboarding: {
    preferences: "/client/onboarding",
    complete: "/client/onboarding/complete",
  },

  // The driver surface. Section names carry the driver prefix where a client
  // section of the same name already exists.
  driverOnboarding: {
    profile: "/driver/onboarding/profile",
    verificationStatus: "/driver/onboarding/verification-status",
    personalInformation: "/driver/onboarding/personal-information",
    experience: "/driver/onboarding/experience",
    academicQualification: "/driver/onboarding/academic-qualification",
    additionalInformation: "/driver/onboarding/additional-information",
    workExperience: "/driver/onboarding/work-experience",
    deleteWorkExperience: (id: string) =>
      `/driver/onboarding/work-experience/${id}`,
    guarantors: "/driver/onboarding/guarantors",
    guarantorFile: (id: string, field: "passport" | "nin-slip") =>
      `/driver/onboarding/guarantors/${id}/${field}`,
    deleteGuarantor: (id: string) => `/driver/onboarding/guarantors/${id}`,
    documents: "/driver/onboarding/documents",
    deleteDocument: (id: string) => `/driver/onboarding/documents/${id}`,
    submit: "/driver/onboarding/submit",
  },

  driverDashboard: {
    stats: "/driver/dashboard/stats",
    upcomingJobs: ({ limit }: { limit: number }) =>
      `/driver/dashboard/upcoming-jobs?limit=${limit}`,
    activities: ({ page, limit }: { page: number; limit: number }) =>
      `/driver/dashboard/activities?page=${page}&limit=${limit}`,
    trustScore: "/driver/dashboard/trust-score",
  },

  driverProfile: {
    workPreferences: "/driver/profile/work-preferences",
    openToWork: "/driver/profile/open-to-work",
    preview: "/driver/profile/preview",
  },

  jobRequests: {
    list: ({
      page,
      limit,
      bucket,
    }: {
      page: number;
      limit: number;
      bucket?: string;
    }) =>
      `/driver/job-requests?page=${page}&limit=${limit}${bucket ? `&bucket=${bucket}` : ""}`,
    summary: "/driver/job-requests/summary",
    get: (reference: string) => `/driver/job-requests/${reference}`,
    attendance: (reference: string, month: string) =>
      `/driver/job-requests/${reference}/attendance?month=${month}`,
    checkIn: (reference: string) =>
      `/driver/job-requests/${reference}/check-in`,
    checkOut: (reference: string) =>
      `/driver/job-requests/${reference}/check-out`,
    start: (reference: string) => `/driver/job-requests/${reference}/start`,
    complete: (reference: string) =>
      `/driver/job-requests/${reference}/complete`,
  },

  shortlists: {
    list: "/driver/shortlists",
    respond: (id: string) => `/driver/shortlists/${id}/respond`,
  },

  earnings: {
    summary: "/driver/earnings",
    history: ({ page, limit }: { page: number; limit: number }) =>
      `/driver/earnings/history?page=${page}&limit=${limit}`,
    trend: "/driver/earnings/trend",
    statement: (month: string) => `/driver/earnings/statements/${month}`,
    banks: ({ country, currency }: { country: string; currency: string }) =>
      `/driver/earnings/banks?country=${country}&currency=${currency}`,
    resolveAccount: "/driver/earnings/banks/resolve",
    bankAccounts: "/driver/earnings/bank-accounts",
    setDefaultBankAccount: (id: string) =>
      `/driver/earnings/bank-accounts/${id}/default`,
    deleteBankAccount: (id: string) => `/driver/earnings/bank-accounts/${id}`,
    withdrawals: ({ page, limit }: { page: number; limit: number }) =>
      `/driver/earnings/withdrawals?page=${page}&limit=${limit}`,
    requestWithdrawal: "/driver/earnings/withdrawals",
  },

  driverReviews: {
    list: ({ page, limit }: { page: number; limit: number }) =>
      `/driver/reviews?page=${page}&limit=${limit}`,
    summary: "/driver/reviews/summary",
  },

  push: {
    web: "/push/web",
    deviceToken: "/push/device-token",
  },

  dashboard: {
    stats: "/client/dashboard/stats",
    overview: "/client/dashboard/overview",
  },

  hires: {
    list: ({ page, limit }: { page: number; limit: number }) =>
      `/client/hires?page=${page}&limit=${limit}`,
    detail: (reference: string) => `/client/hires/${reference}`,
    attendance: (reference: string, month: string) =>
      `/client/hires/${reference}/attendance?month=${month}`,
    flagDay: (reference: string, id: string) =>
      `/client/hires/${reference}/attendance/${id}/flag`,
  },

  requests: {
    list: ({ page, limit }: { page: number; limit: number }) =>
      `/client/requests?page=${page}&limit=${limit}`,
    create: "/client/requests",
    close: (reference: string) => `/client/requests/${reference}/close`,
    matches: (
      reference: string,
      { page, limit }: { page: number; limit: number },
    ) => `/client/requests/${reference}/matches?page=${page}&limit=${limit}`,
  },

  bookings: {
    list: ({ page, limit }: { page: number; limit: number }) =>
      `/client/bookings?page=${page}&limit=${limit}`,
    detail: (reference: string) => `/client/bookings/${reference}`,
    cancel: (reference: string) => `/client/bookings/${reference}/cancel`,
    review: (reference: string) => `/client/bookings/${reference}/review`,
  },

  notifications: {
    list: ({ page, limit }: { page: number; limit: number }) =>
      `/notifications?page=${page}&limit=${limit}`,
    unreadCount: "/notifications/unread-count",
    preferences: "/notifications/preferences",
    markAsRead: (id: string) => `/notifications/${id}/read`,
    markAllAsRead: "/notifications/read-all",
    remove: (id: string) => `/notifications/${id}`,
  },

  tickets: {
    create: "/tickets",
    list: ({ page, limit }: { page: number; limit: number }) =>
      `/tickets?page=${page}&limit=${limit}`,
    get: (id: string) => `/tickets/${id}`,
    comment: (id: string) => `/tickets/${id}/comments`,
  },

  // The admin surface - /api/admin/*, documented in ../tegat-server/docs/admin-api.md.
  adminDashboard: {
    stats: "/admin/dashboard/stats",
    nav: "/admin/dashboard/nav",
    overview: (period: "7d" | "30d" | "90d") =>
      `/admin/dashboard/overview?period=${period}`,
    growth: (period: "7d" | "14d" | "30d") =>
      `/admin/dashboard/growth?period=${period}`,
    visitors: (period: "7d" | "14d" | "30d") =>
      `/admin/dashboard/visitors?period=${period}`,
    activities: ({ limit }: { limit: number }) =>
      `/admin/dashboard/activities?limit=${limit}`,
  },

  adminUsers: {
    list: ({
      page,
      limit,
      role,
      status,
      search,
    }: {
      page: number;
      limit: number;
      role?: "DRIVER" | "CLIENT";
      status?: string;
      search?: string;
    }) =>
      `/admin/users?page=${page}&limit=${limit}${role ? `&role=${role}` : ""}${status ? `&status=${status}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}`,
    stats: (role: "DRIVER" | "CLIENT") => `/admin/users/stats?role=${role}`,
    detail: (id: string) => `/admin/users/${id}`,
    wallet: (id: string, { page, limit }: { page: number; limit: number }) =>
      `/admin/users/${id}/wallet?page=${page}&limit=${limit}`,
    activities: (
      id: string,
      { page, limit }: { page: number; limit: number },
    ) => `/admin/users/${id}/activities?page=${page}&limit=${limit}`,
    suspend: (id: string) => `/admin/users/${id}/suspend`,
    reactivate: (id: string) => `/admin/users/${id}/reactivate`,
    remove: (id: string) => `/admin/users/${id}`,
  },

  adminVerifications: {
    queue: ({
      page,
      limit,
      status,
      search,
    }: {
      page: number;
      limit: number;
      status?: string;
      search?: string;
    }) =>
      `/admin/verifications?page=${page}&limit=${limit}${status ? `&status=${status}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}`,
    submission: (userId: string) => `/admin/verifications/${userId}`,
    reviewDocument: (documentId: string) =>
      `/admin/verifications/documents/${documentId}`,
    reviewSubmission: (userId: string) => `/admin/verifications/${userId}`,
  },

  adminTransactions: {
    stats: "/admin/transactions/stats",
    payouts: ({
      page,
      limit,
      status,
    }: {
      page: number;
      limit: number;
      status?: string;
    }) =>
      `/admin/payouts?page=${page}&limit=${limit}${status ? `&status=${status}` : ""}`,
    payout: (reference: string) => `/admin/payouts/${reference}`,
    settlePayout: (reference: string) => `/admin/payouts/${reference}`,
  },

  adminTeam: {
    list: ({
      page,
      limit,
      search,
    }: {
      page: number;
      limit: number;
      search?: string;
    }) =>
      `/admin/team?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ""}`,
    invite: "/admin/team/invite",
    role: (id: string) => `/admin/team/${id}/role`,
    suspend: (id: string) => `/admin/team/${id}/suspend`,
    reactivate: (id: string) => `/admin/team/${id}/reactivate`,
    remove: (id: string) => `/admin/team/${id}`,
  },

  adminTickets: {
    list: ({
      page,
      limit,
      status,
    }: {
      page: number;
      limit: number;
      status?: string;
    }) =>
      `/admin/tickets?page=${page}&limit=${limit}${status ? `&status=${status}` : ""}`,
    get: (id: string) => `/admin/tickets/${id}`,
    comment: (id: string) => `/admin/tickets/${id}/comments`,
    update: (id: string) => `/admin/tickets/${id}`,
  },

  chat: {
    conversation: "/chat/conversation",
    message: "/chat/message",
    read: (conversationId: string) => `/chat/${conversationId}/read`,
  },

  hireRequests: {
    create: "/client/hire-requests",
    list: ({
      page,
      limit,
      status,
    }: {
      page: number;
      limit: number;
      status?: string;
    }) =>
      `/client/hire-requests?page=${page}&limit=${limit}${status ? `&status=${status}` : ""}`,
    detail: (reference: string) => `/client/hire-requests/${reference}`,
    proof: (reference: string) => `/client/hire-requests/${reference}/proof`,
    cancel: (reference: string) => `/client/hire-requests/${reference}/cancel`,
  },

  invoices: {
    list: ({
      page,
      limit,
      status,
    }: {
      page: number;
      limit: number;
      status?: string;
    }) =>
      `/client/invoices?page=${page}&limit=${limit}${status ? `&status=${status}` : ""}`,
  },

  adminHires: {
    list: ({
      page,
      limit,
      status,
      q,
    }: {
      page: number;
      limit: number;
      status?: string;
      q?: string;
    }) =>
      `/admin/hires?page=${page}&limit=${limit}${status ? `&status=${status}` : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}`,
    detail: (reference: string) => `/admin/hires/${reference}`,
    assign: (reference: string) => `/admin/hires/${reference}/assign`,
    unassign: (reference: string) => `/admin/hires/${reference}/unassign`,
    invoice: (reference: string) => `/admin/hires/${reference}/invoice`,
    invoiceQuote: (reference: string, query = "") =>
      `/admin/hires/${reference}/invoice-quote${query ? `?${query}` : ""}`,
    pricingGuide: "/admin/hires/pricing-guide",
    confirmPayment: (reference: string) =>
      `/admin/hires/${reference}/confirm-payment`,
    rejectProof: (reference: string) =>
      `/admin/hires/${reference}/reject-proof`,
    decline: (reference: string) => `/admin/hires/${reference}/decline`,
  },

  search: {
    client: (q: string) => `/client/search?q=${encodeURIComponent(q)}`,
    driver: (q: string) => `/driver/search?q=${encodeURIComponent(q)}`,
    admin: (q: string) => `/admin/search?q=${encodeURIComponent(q)}`,
  },

  adminAttendance: {
    flags: ({
      page,
      limit,
      status,
    }: {
      page: number;
      limit: number;
      status: "open" | "resolved";
    }) =>
      `/admin/attendance/flags?status=${status}&page=${page}&limit=${limit}`,
    resolve: (id: string) => `/admin/attendance/flags/${id}/resolve`,
    booking: (reference: string, month: string) =>
      `/admin/attendance/bookings/${reference}?month=${month}`,
  },

  adminChat: {
    list: ({
      page,
      limit,
      status,
    }: {
      page: number;
      limit: number;
      status?: string;
    }) =>
      `/admin/chat?page=${page}&limit=${limit}${status ? `&status=${status}` : ""}`,
    get: (conversationId: string) => `/admin/chat/${conversationId}`,
    join: (conversationId: string) => `/admin/chat/${conversationId}/join`,
    message: (conversationId: string) =>
      `/admin/chat/${conversationId}/message`,
    resolve: (conversationId: string) =>
      `/admin/chat/${conversationId}/resolve`,
    read: (conversationId: string) => `/admin/chat/${conversationId}/read`,
  },
} as const;

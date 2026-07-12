export const permissions = {
  reservation: { create: ['ADMIN','MANAGER','FRONT_DESK'], cancel: ['ADMIN','MANAGER'] },
  billing: { postPayment: ['ADMIN','MANAGER','FRONT_DESK'], void: ['ADMIN'], refund: ['ADMIN','MANAGER'] },
  housekeeping: { assignTask: ['ADMIN','MANAGER'], completeTask: ['ADMIN','MANAGER','HOUSEKEEPING'] },
  staff: { manage: ['ADMIN'] },
} as const;
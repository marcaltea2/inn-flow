export const permissions = {
  reservation: {
    create: ["ADMIN", "MANAGER", "FRONT_DESK"],
    cancel: ["ADMIN", "MANAGER"],
  },
  billing: {
    postPayment: ["ADMIN", "MANAGER", "FRONT_DESK"],
    void: ["ADMIN"],
    refund: ["ADMIN", "MANAGER"],
  },
  room: {
    manage: ["ADMIN", "MANAGER"],
    setStatus: ["ADMIN", "MANAGER", "HOUSEKEEPING"],
  },
  roomType: {
    manage: ["ADMIN", "MANAGER"],
  },
  amenity: {
    manage: ["ADMIN", "MANAGER"],
  },
  housekeeping: {
    assignTask: ["ADMIN", "MANAGER"],
    completeTask: ["ADMIN", "MANAGER", "HOUSEKEEPING"],
  },
  staff: {
    view: ["ADMIN", "MANAGER"],
    manage: ["ADMIN"],
  },
} as const;

export type Resource = keyof typeof permissions;
export type Action<R extends Resource> = keyof (typeof permissions)[R];

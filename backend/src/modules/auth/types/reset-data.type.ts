interface IResetData {
  userId : number;
  email : string;
  createdAt : Date;
}

interface IAdminResetData {
  adminId : number;
  email : string;
  createdAt : Date;
}

interface IPendingUser {
  email: string;
  passwordHash: string;
  verificationToken: string;
  fullName: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

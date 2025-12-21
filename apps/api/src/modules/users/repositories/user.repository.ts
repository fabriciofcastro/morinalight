export type UserRecord = {
  userId: string;
  email: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  passwordHash: string;
  status: string;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  cpf?: string | null;
  phone?: string | null;
  birthDate?: Date | null;
  admissionDate?: Date | null;
  observations?: string | null;
};

export type CreateUserInput = {
  userId: string;
  email: string;
  passwordHash: string;
  displayName?: string | null;
  status?: string;
  cpf?: string | null;
  phone?: string | null;
  birthDate?: Date | null;
  admissionDate?: Date | null;
  observations?: string | null;
  avatarUrl?: string | null;
};

export type UpdateUserInput = {
  userId: string;
  email?: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  status?: string;
  passwordHash?: string;
  cpf?: string | null;
  phone?: string | null;
  birthDate?: Date | null;
  admissionDate?: Date | null;
  observations?: string | null;
};

export interface UserRepository {
  findByEmail(email: string): Promise<UserRecord | null>;
  findById(userId: string): Promise<UserRecord | null>;
  findManyByIds(userIds: string[]): Promise<UserRecord[]>;
  create(input: CreateUserInput): Promise<UserRecord>;
  update?(input: UpdateUserInput): Promise<UserRecord | null>;
  delete?(userId: string): Promise<void>;
  setLastLogin(userId: string, date: Date): Promise<void>;
}

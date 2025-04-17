import { Model } from 'sequelize';

export interface IUser {
  id?: number;
  email: string;
  name: string;
  firebaseUid: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITask {
  id?: number;
  title: string;
  description?: string;
  dueDate?: Date;
  status?: string;
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserModel extends Model<IUser>, IUser {}
export interface ITaskModel extends Model<ITask>, ITask {}

export interface IAuthRequest {
  user: {
    id: string;
    email: string;
  };
}

export interface ICreateTaskRequest {
  title: string;
  description?: string;
  dueDate?: Date;
  status?: string;
}

export interface IUpdateTaskRequest extends Partial<ICreateTaskRequest> {
  status?: string;
} 
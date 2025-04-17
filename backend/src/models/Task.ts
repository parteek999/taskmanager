import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { ITask, ITaskModel } from '../types';
import User from './User';

class Task extends Model {
  public id!: number;
  public title!: string;
  public description!: string;
  public dueDate!: Date;
  public status!: string;
  public createdBy!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Task.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Task',
    tableName: 'tasks',
    underscored: true,
  }
);

Task.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator',
});

export default Task; 
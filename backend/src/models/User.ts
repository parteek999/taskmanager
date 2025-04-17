import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { IUser } from '../types';

class User extends Model<IUser> {
  public id!: number;
  public email!: string;
  public name!: string;
  public firebaseUid!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firebaseUid: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    }
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
  }
);

export default User; 
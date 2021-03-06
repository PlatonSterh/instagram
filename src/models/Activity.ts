import { DataTypes, Model } from "sequelize";
import sequelize from "../utils/database";

export interface ActivityInstance extends Model {
  id: number;
  content: string;
  authorId: number;
  createdAt: Date;
  dataValues?: ActivityInstance;
}

const Activity = sequelize.define<ActivityInstance>("activity", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

export default Activity;

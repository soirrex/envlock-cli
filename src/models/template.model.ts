import { DataTypes, Model, Sequelize } from "sequelize";

export interface TemplateAttributes {
  id: string;
  containerId: number | null | undefined;
  name: string;
  description: string | null;
  encrypted_data: string;
  salt: string;
  tag: string;
  iv: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class TemplateModel extends Model<TemplateAttributes> {
  declare id: string;
  declare containerId: number | null | undefined;
  declare name: string;
  declare description: string | null;
  declare encrypted_data: string;
  declare salt: string;
  declare tag: string;
  declare iv: string;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initialize(sequelize: Sequelize) {
    TemplateModel.init(
      {
        id: {
          type: DataTypes.STRING,
          allowNull: false,
          primaryKey: true,
          unique: true,
        },
        containerId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: null,
        },
        name: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },
        description: {
          type: DataTypes.STRING(200),
          allowNull: true,
        },
        encrypted_data: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        salt: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        tag: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        iv: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        indexes: [{ fields: ["name"] }, { fields: ["containerId"] }],
        sequelize,
        modelName: "Template",
        tableName: "templates",
        timestamps: true,
      },
    );
  }
}

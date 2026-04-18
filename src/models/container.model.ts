import { DataTypes, Model, Sequelize } from "sequelize";

interface ContainerAttributes {
  id?: number;
  name: string;
}

export class ContainerModel extends Model<ContainerAttributes> {
  declare id?: number;
  declare name: string;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initialize(sequelize: Sequelize) {
    ContainerModel.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },
      },
      {
        indexes: [{ fields: ["name"] }],
        sequelize,
        modelName: "Container",
        tableName: "containers",
        timestamps: true,
      },
    );
  }
}

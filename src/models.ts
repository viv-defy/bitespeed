import { Model, DataTypes } from 'sequelize';
import { sequelize } from './db';

export class Contact extends Model {
    public id!: number;
    public phoneNumber: string | undefined;
    public email: string | undefined;
    public linkedId: number | undefined;
    public linkPrecedence!: string;
    public createdAt!: Date;
    public updatedAt!: Date;
}

Contact.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    phoneNumber: {
        type: DataTypes.STRING,
        field: 'phone_number',
    },
    email: DataTypes.STRING,
    linkedId: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'linked_id',
    },
    linkPrecedence: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'link_precedence',
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
    },
    deletedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'deleted_at',
    },
  },
  {
    sequelize,
    tableName: 'contacts',
    modelName: 'Contact',
  }
);

export interface ContactResponse {
    primaryContatctId: number,
    emails: string[],
    phoneNumbers: string,
    secondaryContactIds: number[]
}

import { Schema, Model, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../../config';

interface IUser {
  nome: string,
  email: string,
  senha: string,
  telefones: [{ numero: String, ddd: String }],
  data_criacao: Date,
  data_atualizacao: Date,
  ultimo_login: Date,
  token: string,
}

interface IUserMethods {
  compareHash(senha: string): Promise<boolean>;
}

interface UserModel extends Model<IUser, {}, IUserMethods> {
  generateToken({ id }: { id: string }): string;
}

const UserSchema = new Schema<IUser, UserModel, IUserMethods>({
  nome: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  senha: {
    type: String,
    required: true,
  },
  telefones: [{ numero: String, ddd: String }],
  data_criacao: {
    type: Date,
    default: Date.now,
  },
  data_atualizacao: {
    type: Date,
    default: Date.now,
  },
  ultimo_login: {
    type: Date,
    default: Date.now,
  },
  token: {
    type: String,
    required: true,
  },
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('senha')) {
    return next();
  }

  this.senha = await bcrypt.hash(this.senha, 8);
  return next();
});

UserSchema.method('compareHash', function compareHash(senha: string) {
  return bcrypt.compare(senha, this.senha);
});

UserSchema.static('generateToken', function generateToken({ id }) {
  return jwt.sign({ id }, config.secret, {
    expiresIn: config.ttl,
  });
});

export default model<IUser, UserModel>('User', UserSchema);

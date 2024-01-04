import { Schema, Model, model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config";

interface IUser {
  name: string;
  email: string;
  password: string;
  phones: [{ number: string; code: string }];
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date;
  token: string;
}

interface IUserMethods {
  compareHash(password: string): Promise<boolean>;
}

interface UserModel extends Model<IUser, NonNullable<unknown>, IUserMethods> {
  generateToken(payload: string): string;
}

const UserSchema = new Schema<IUser, UserModel, IUserMethods>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  phones: [{ number: String, code: String }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  token: {
    type: String,
    required: true,
  },
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 8);
  return next();
});

UserSchema.method("compareHash", function compareHash(password: string) {
  return bcrypt.compare(password, this.password);
});

UserSchema.static("generateToken", function generateToken(payload: string) {
  return jwt.sign({ payload }, config.secret, {
    expiresIn: config.ttl,
  });
});

export default model<IUser, UserModel>("User", UserSchema);

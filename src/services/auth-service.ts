import bcryot from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user-model";

export class AuthServices {
  async login(email: string, password: string) {
    const userModel = await UserModel.findByEmail(email);
    if (userModel && bcryot.compareSync(password, userModel.password)) {
      return jwt.sign({ id: userModel.id, email: userModel.email }, "123456", {
        expiresIn: "1h",
      });
    } else {
      throw new InvalidCredentialsError();
    }
  }
}

export class InvalidCredentialsError extends Error {}

import { Database } from "../database";
import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import bcryot from "bcrypt";

export class UserModel {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at: Date;

  constructor(data: Partial<UserModel>) {
    this.fill(data);
  }

  static async create(
    data: {
      name: string;
      email: string;
      password: string;
    },
    options?: { connection?: PoolConnection }
  ): Promise<UserModel> {
    const db =
      options?.connection ?? (await Database.getInstance().getConnection());
    const createdAt = new Date();
    const hashedPassword = UserModel.hashPassword(data.password);
    const [userResult] = await db.execute<ResultSetHeader>(
      "INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, ?)",
      [data.name, data.email, hashedPassword, createdAt]
    );
    return new UserModel({
      ...data,
      password: hashedPassword,
      id: userResult.insertId,
      created_at: createdAt,
    });
  }

  static hashPassword(password: string): string {
    return bcryot.hashSync(password, 10);
  }

  static comparePassword(password: string, hash: string): boolean {
    return bcryot.compareSync(password, hash);
  }

  static async findById(id: number): Promise<UserModel | null> {
    const db = await Database.getInstance().getConnection();
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM users WHERE id =?",
      [id]
    );
    return rows.length ? new UserModel(rows[0] as UserModel) : null;
  }

  static async findByEmail(email: string): Promise<UserModel | null> {
    const db = await Database.getInstance().getConnection();
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM users WHERE email =?",
      [email]
    );
    return rows.length ? new UserModel(rows[0] as UserModel) : null;
  }

  static async findAll(): Promise<UserModel[]> {
    const db = await Database.getInstance().getConnection();
    const [rows] = await db.execute<RowDataPacket[]>("SELECT * FROM users");
    return rows.map((row) => new UserModel(row as UserModel));
  }

  async update(): Promise<void> {
    const db = await Database.getInstance().getConnection();
    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?",
      [this.name, this.email, this.password, this.id]
    );
    if (result.affectedRows === 0) {
      throw new Error("User not found");
    }
  }

  async delete(): Promise<void> {
    const db = await Database.getInstance().getConnection();
    const [result] = await db.execute<ResultSetHeader>(
      "DELETE FROM users WHERE id =?",
      [this.id]
    );
    if (result.affectedRows === 0) {
      throw new Error("User not found");
    }
  }

  fill(data: Partial<UserModel>) {
    if (data.id !== undefined) this.id = data.id;
    if (data.name !== undefined) this.name = data.name;
    if (data.email !== undefined) this.email = data.email;
    if (data.password !== undefined) this.password = data.password;
    if (data.created_at !== undefined) this.created_at = data.created_at;
  }
}

import { Database } from "../database";
import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { UserModel } from "./user-model";

export class PartnerModel {
  id: number;
  user_id: number;
  company_name: string;
  created_at: Date;
  user?: UserModel;

  constructor(data: Partial<PartnerModel> = {}) {
    this.fill(data);
  }

  static async create(
    data: {
      user_id: number;
      company_name: string;
    },
    options?: { connection?: PoolConnection }
  ): Promise<PartnerModel> {
    const db = await Database.getInstance().getConnection();
    const created_at = new Date();
    const [result] = await db.execute<ResultSetHeader>(
      "INSERT INTO partners (user_id, company_name, created_at) VALUES (?, ?, ?)",
      [data.user_id, data.company_name, created_at]
    );
    const partner = new PartnerModel({
      ...data,
      created_at,
      id: result.insertId,
    });
    return partner;
  }

  static async findById(
    id: number,
    options?: { user?: boolean }
  ): Promise<PartnerModel | null> {
    const db = await Database.getInstance().getConnection();
    let query = "SELECT * FROM partners WHERE id = ?";
    if (options?.user) {
      query =
        "SELECT p.*, users.id as user_id, users.name as user_name, users.email as user_email FROM partners p LEFT JOIN users ON p.user_id = users.id WHERE p.id =?";
    }
    const [rows] = await db.execute<RowDataPacket[]>(query, [id]);
    if (rows.length === 0) {
      return null;
    }
    const patner = new PartnerModel(rows[0] as PartnerModel);

    if (options?.user) {
      patner.user = new UserModel({
        id: rows[0].user_id,
        name: rows[0].user_name,
        email: rows[0].user_email,
      });
    }

    return patner;
  }

  static async findByUserId(
    userId: number,
    options?: { user?: boolean }
  ): Promise<PartnerModel | null> {
    const db = await Database.getInstance().getConnection();
    let query = "SELECT * FROM partners WHERE user_id =?";
    if (options?.user) {
      query =
        "SELECT p.*, users.id as user_id, users.name as user_name, users.email as user_email FROM partners p LEFT JOIN users ON p.user_id = users.id WHERE p.user_id =?";
    }
    const [rows] = await db.execute<RowDataPacket[]>(query, [userId]);
    if (rows.length === 0) {
      return null;
    }
    const patner = new PartnerModel(rows[0] as PartnerModel);
    if (options?.user) {
      patner.user = new UserModel({
        id: rows[0].user_id,
        name: rows[0].user_name,
        email: rows[0].user_email,
      });
    }
    return patner;
  }

  static async findAll(): Promise<PartnerModel[]> {
    const db = await Database.getInstance().getConnection();
    const [rows] = await db.execute<RowDataPacket[]>("SELECT * FROM partners");
    return rows.map((row) => new PartnerModel(row as PartnerModel));
  }

  async update(): Promise<void> {
    const db = await Database.getInstance().getConnection();
    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE partners SET user_id = ?, company_name = ? WHERE id = ?",
      [this.user_id, this.company_name, this.id]
    );
    if (result.affectedRows === 0) {
      throw new Error("Partner not found");
    }
  }

  async delete(): Promise<void> {
    const db = await Database.getInstance().getConnection();
    const [result] = await db.execute<ResultSetHeader>(
      "DELETE FROM partners WHERE id = ?",
      [this.id]
    );
    if (result.affectedRows === 0) {
      throw new Error("Partner not found");
    }
  }

  fill(data: Partial<PartnerModel>): void {
    if (data.id !== undefined) this.id = data.id;
    if (data.user_id !== undefined) this.user_id = data.user_id;
    if (data.company_name !== undefined) this.company_name = data.company_name;
    if (data.created_at !== undefined) this.created_at = data.created_at;
  }
}

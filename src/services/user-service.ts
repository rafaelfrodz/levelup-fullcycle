import * as mysql from "mysql2/promise";
import { Database } from "../database";

export class UserService {
    async findById(userId: number) {
        const connection = Database.getInstance();
        try {
        const [rows] = await connection.execute<mysql.RowDataPacket[]>(
            "SELECT * FROM users WHERE id = ?", 
            [userId]
        );
        return rows.length ? rows[0]: null;
        } finally {
            await connection.end();
        }
    }

    async findByEmail(email: string) {
        const connection = Database.getInstance();
        try {
        const [rows] = await connection.execute<mysql.RowDataPacket[]>(
            "SELECT * FROM users WHERE email = ?", 
            [email]
        );
        return rows.length ? rows[0]: null;
        } finally {
            await connection.end();
        }
    }
}
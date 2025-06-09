import { createConnection } from "../database";
import * as mysql from "mysql2/promise";
import bcryot from "bcrypt";


export class PartnerService {
    async register(data: {
        name: string;
        email: string;
        password: string;
        company_name: string
    }) {
        const {name, email, password, company_name} = data
        const connection = await createConnection();
        try {
            const createdAt = new Date();
            const hashedPassword = bcryot.hashSync(password, 10);
            const [userResult] = await connection.execute<mysql.ResultSetHeader>('INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, ?)', [
              name, 
              email, 
              hashedPassword, 
              createdAt
            ]);
      
            const userId = userResult.insertId;
            const [partnerResults] = await connection.execute<mysql.ResultSetHeader>('INSERT INTO partners (user_id, company_name, created_at) VALUES (?, ?, ?)',[
              userId, 
              company_name, 
              createdAt
            ]);
            return{ id: partnerResults.insertId, name, user_id: userId, company_name, created_at: createdAt};
        } finally {
          await connection.end();
        }
    }
}
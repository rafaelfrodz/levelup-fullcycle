import { Database } from "../database";
import * as mysql from "mysql2/promise";

export class EventService {
    async create(data: {
        name: string; 
        description: string | null; 
        date: Date; 
        location: string;
        patnerId: number;
    }) {
        const {name, description, date, location, patnerId} = data
        const connection = Database.getInstance();
        try {
          const eventDate = new Date(date);
          const createdAt = new Date();
          const [eventResults] = await connection.execute<mysql.ResultSetHeader>('INSERT INTO events (name, description, date, location, created_at, partners_id) VALUES (?, ?, ?, ?, ?, ?)',[
            name, 
            description, 
            eventDate,
            location,
            createdAt,
            patnerId,
          ]);
          return{ id: eventResults.insertId, name, description, date: eventDate, location, created_at: createdAt, partner_id: patnerId};
      
        } finally {
          await connection.end();
        }
    }

    async findAll(partnerId?: number) {
        const connection = Database.getInstance();
        try {
           const query = partnerId 
               ? "SELECT * FROM events WHERE partners_id =?" 
               : "SELECT * FROM events";
           const params = partnerId ? [partnerId] : [];
           const [eventsRows] = await connection.execute<mysql.RowDataPacket[]>(
            query,
            params
          );
          return eventsRows.length? eventsRows : null;
        } finally {
            await connection.end();
        }
    }

    async findById(eventId: number) {
        const connection = Database.getInstance();
        try {  
          const [eventsRows] = await connection.execute<mysql.RowDataPacket[]>(
            "SELECT * FROM events WHERE id =?",
            [eventId]
          );
          return eventsRows.length ? eventsRows[0] : null;
        } finally {
          await connection.end();
        }
    }
}
export class Notauthorized extends Error {}
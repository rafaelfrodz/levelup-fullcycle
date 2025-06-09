import { Router } from "express";
import { createConnection } from "../database";
import * as mysql from "mysql2/promise";
import { PartnerService } from "../services/patner-service";
import { EventService } from "../services/event-service";

export const partnerRoutes = Router();

partnerRoutes.post("/register", async (req, res) => {
  const {name, email, password, company_name} = req.body;
  const patnerService = new PartnerService();
  const patnerResult = await patnerService.register({
    name,
    email,
    password,
    company_name
  });
  res.status(201).json(patnerResult);

});

partnerRoutes.post("/events", async (req, res) => {
  // adicionar try e finally
    const {name, description, date, location} = req.body;
    const patnerId = req.user!.id;
    const eventService = new EventService();
    const connection = await createConnection();
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM partners WHERE user_id = ?", 
      [patnerId]
    );
    const partner = rows.length ? rows[0]: null;
    if (!partner) {
      res.status(403).json({message: "Not authorized"});
      return;
    }
    const eventResult = await eventService.create({
      name,
      description,
      date,
      location,
      patnerId: partner.id
    });
    res.status(201).json(eventResult);

  });
  
  partnerRoutes.get("/events", async (req, res) => {
    const partnerId = req.user!.id;
    const connection = await createConnection();
    try {
      const [rows] = await connection.execute<mysql.RowDataPacket[]>(
        "SELECT * FROM partners WHERE user_id = ?", 
        [partnerId]
      );
      const partner = rows.length ? rows[0]: null;
      if (!partner) {
        res.status(403).json({message: "Not authorized"});
        return;
      }
      const eventService = new EventService();
      const eventsResult = await eventService.findAll(partner.id);
      res.status(200).json(eventsResult);

    } finally {
      await connection.end();
    }
  });
  
  partnerRoutes.get("/events/:eventId", async (req, res) => {
    const {eventId} = req.params;
    const partnerId = req.user!.id;
    const connection = await createConnection();
    try {
      const [rows] = await connection.execute<mysql.RowDataPacket[]>(
        "SELECT * FROM partners WHERE user_id = ?", 
        [partnerId]
      );
      const partner = rows.length ? rows[0]: null;
      if (!partner) {
        res.status(403).json({message: "Not authorized"});
        return;
      }
  
      const eventService = new EventService();
      const eventResult = await eventService.findById(+eventId);
      
      if (!eventResult || eventResult.partners_id !== partner.id) {
        res.status(404).json({message: "Event not found"});
        return;
      }
      res.status(200).json(eventResult);
  
    } finally {
      await connection.end();
    }
  });
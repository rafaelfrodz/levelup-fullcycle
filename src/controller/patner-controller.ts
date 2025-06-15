import { Router } from "express";
import { PartnerService } from "../services/patner-service";
import { EventService } from "../services/event-service";

export const partnerRoutes = Router();

partnerRoutes.post("/register", async (req, res) => {
  const { name, email, password, company_name } = req.body;
  const patnerService = new PartnerService();
  const patnerResult = await patnerService.register({
    name,
    email,
    password,
    company_name,
  });
  res.status(201).json(patnerResult);
});

partnerRoutes.post("/events", async (req, res) => {
  // adicionar try e finally
  const { name, description, date, location } = req.body;
  const patnerId = req.user!.id;
  const eventService = new EventService();
  const partnerService = new PartnerService();
  const partnerResult = await partnerService.findByUserId(patnerId);
  if (!partnerResult) {
    res.status(403).json({ message: "Not authorized" });
    return;
  }
  const eventResult = await eventService.create({
    name,
    description,
    date,
    location,
    patnerId: partnerResult.id,
  });
  res.status(201).json(eventResult);
});

partnerRoutes.get("/events", async (req, res) => {
  const partnerId = req.user!.id;
  const partnerService = new PartnerService();
  const patnerResult = await partnerService.findByUserId(partnerId);
  if (!patnerResult) {
    res.status(403).json({ message: "Not authorized" });
    return;
  }
  const eventService = new EventService();
  const eventsResult = await eventService.findAll(patnerResult.id);
  res.status(200).json(eventsResult);
});

partnerRoutes.get("/events/:eventId", async (req, res) => {
  const { eventId } = req.params;
  const partnerId = req.user!.id;
  const partnerService = new PartnerService();
  const partnerResult = await partnerService.findByUserId(partnerId);
  if (!partnerResult) {
    res.status(403).json({ message: "Not authorized" });
    return;
  }

  const eventService = new EventService();
  const eventResult = await eventService.findById(+eventId);

  if (!eventResult || eventResult.partner_id !== partnerResult.id) {
    res.status(404).json({ message: "Event not found" });
    return;
  }
  res.status(200).json(eventResult);
});

import { Router } from "express";
import { EventService } from "../services/event-service";

export const eventRoutes = Router();

eventRoutes.get("/", async (req, res) => {
  const eventService = new EventService();
  const eventsResult = await eventService.findAll();
  res.status(200).json(eventsResult);
});

eventRoutes.get("/:eventId", async (req, res) => {
  const { eventId } = req.params;
  const eventService = new EventService();
  const eventResult = await eventService.findById(+eventId);

  if (!eventResult) {
    res.status(404).json({ message: "Event not found" });
    return;
  }
  res.status(200).json(eventResult);
});

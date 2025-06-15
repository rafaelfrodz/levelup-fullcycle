import { Router } from "express";
import { TicketService } from "../services/ticket-service";
import { PartnerService } from "../services/patner-service";

export const ticketRoutes = Router();

ticketRoutes.post("/:eventId/tickets", async (req, res) => {
  const partnerId = req.user!.id;
  const partnerService = new PartnerService();
  const partnerResult = await partnerService.findByUserId(partnerId);

  if (!partnerResult) {
    res.status(403).json({ message: "Not authorized" });
    return;
  }

  const { num_tickets, price } = req.body;
  const { eventId } = req.params;

  const ticketService = new TicketService();
  await ticketService.createMany({
    eventId: +eventId,
    numTickets: num_tickets,
    price,
  });
  res.status(204).send();
});

ticketRoutes.get("/:eventId/tickets", async (req, res) => {});

ticketRoutes.get("/:eventId/tickets/:ticketId", async (req, res) => {});

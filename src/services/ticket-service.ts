import { EventModel } from "../models/event-model";
import { TicketModel, TicketStatus } from "../models/ticket-model";

export class TicketService {
  async createMany(data: {
    eventId: number;
    numTickets: number;
    price: number;
  }) {
    const { eventId, price, numTickets } = data;
    const event = await EventModel.findById(eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    const ticketsData = Array(data.numTickets)
      .fill({})
      .map((_, i) => ({
        event_id: event.id,
        price: data.price,
        status: TicketStatus.available,
        location: `Location ${i}`,
      }));
    await TicketModel.createMany(ticketsData);
  }
}

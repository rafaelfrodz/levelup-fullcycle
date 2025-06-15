import { EventModel } from "../models/event-model";

export class EventService {
  async create(data: {
    name: string;
    description: string | null;
    date: Date;
    location: string;
    patnerId: number;
  }) {
    const { name, description, date, location, patnerId } = data;
    const event = await EventModel.create({
      name,
      description,
      date,
      location,
      partner_id: patnerId,
    });
    return {
      id: event.id,
      name,
      description,
      date,
      location,
      created_at: event.created_at,
      partner_id: patnerId,
    };
  }

  async findAll(partnerId?: number) {
    return EventModel.findAll({
      where: { partner_id: partnerId },
    });
  }

  async findById(eventId: number) {
    return EventModel.findById(eventId);
  }
}
export class Notauthorized extends Error {}

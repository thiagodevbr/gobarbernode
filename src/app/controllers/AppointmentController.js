import Appointment from "../models/Appointment";
import User from "../models/User";
import File from "../models/File"
import Notification from "../schemas/Notification"
import * as Yup from "yup";
import {
  startOfHour,
  parseISO,
  isBefore,
  format,
  subHours
} from "date-fns";
import pt from 'date-fns/locale/pt-BR'
import Queue from "../../lib/Queue"
import CancellationMail from "../jobs/CancellationMail"

class AppointmentController {
  async index(req, res) {
    const {
      page = 1
    } = req.query
    const appointments = await Appointment.findAll({
      where: {
        user_id: req.userId,
        canceled_at: null,
      },
      attributes: ["id", "date", "past", "cancelable"],
      order: ['date'],
      limit: 20,
      offset: (page - 1) * 10,
      include: [{
        model: User,
        as: 'provider',
        attributes: ["id", "name", "email"],
        include: [{
          model: File,
          as: "avatar",
          attributes: ["id", "path", "url"]
        }]
      }]
    })

    if (!appointments) {
      return res.status(400).json({
        error: "User don't have any appointment"
      })
    }

    return res.json(appointments)
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      date: Yup.date().required(),
      provider_id: Yup.number().required()
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: "Validation fails"
      });
    }

    if (req.body.provider_id === req.userId) {
      return res.status(400).json({
        error: "Provider can't mark appointment with himself"
      })
    }

    const {
      provider_id,
      date
    } = req.body;

    if (
      !(await User.findOne({
        where: {
          id: provider_id,
          provider: true
        }
      }))
    ) {
      return res.status(400).json({
        error: "User is not a provider"
      });
    }

    const hourStart = startOfHour(parseISO(date));
    console.log(startOfHour(parseISO(date)), date);
    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({
        error: "Past dates are not permitted"
      });
    }

    if (
      await Appointment.findOne({
        where: {
          provider_id,
          canceled_at: null,
          date: hourStart
        }
      })
    ) {
      return res.status(400).json({
        error: "Appointment is not available"
      });
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date: hourStart
    });

    const userName = await User.findByPk(req.userId)
    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', às' H'h'mm", {
        locale: pt
      }
    )

    await Notification.create({
      content: `Novo agendamento de ${userName.name} para o ${formattedDate}`,
      user: provider_id
    })

    return res.json(appointment);
  }

  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [{
          model: User,
          as: 'provider',
          attributes: ["name", "email"]
        },
        {
          model: User,
          as: 'user',
          attributes: ['name']
        }
      ]
    })
    if (!appointment) {
      return res.status(400).json({
        error: "Appointment not found"
      })
    }
    if (appointment.user_id !== req.userId) {
      return res.status(400).json({
        error: "You can't access this appointment"
      })
    }

    const dateWithSub = subHours(appointment.date, 2)

    if (isBefore(dateWithSub, new Date())) {
      return res.status(401).json({
        error: "You can only cancel appointment with 2 hours before"
      })
    }

    appointment.canceled_at = new Date()

    await appointment.save()

    await Queue.add(CancellationMail.key, {
      appointment
    })

    return res.json(appointment)


  }
}

export default new AppointmentController();
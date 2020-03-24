import Appointment from '../models/Appointment';
import User from '../models/User';
import {
  parseISO,
  startOfDay,
  endOfDay
} from 'date-fns';
import {
  Op
} from "sequelize"

class ScheduleController {
  async index(req, res) {
    const checkUser = await User.findOne({
      where: {
        id: req.userId,
        provider: true
      }
    })

    if (!checkUser) {
      return res.status(400).json({
        error: "User is not a provider"
      })
    }

    const {
      date
    } = req.query
    const parsedDate = parseISO(date)
    console.log("date", parsedDate)

    const appointments = await Appointment.findAll({
      where: {
        provider_id: req.userId,
        canceled_at: null,
        date: {
          [Op.between]: [
            startOfDay(parsedDate), endOfDay(parsedDate)
          ]
        }
      },
      order: ["date"]
    })

    if (!appointments) {
      return res.status(401).json({
        error: "You don't have any appointment"
      })
    }

    return res.json(appointments)
  }
}
export default new ScheduleController()
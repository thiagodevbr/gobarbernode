import User from "../models/User"
import File from "../models/File"

class ProviderController {
  async index(req, res) {
    const users = await User.findAll({
      where: {
        provider: true
      },
      attributes: ['id', 'name', 'email', 'avatar_id'],
      include: [{
        model: File,
        as: 'avatar',
        attributes: ['id', 'name', 'path', 'url']
      }]
    })
    if (!users) {
      return res.status(401).json({
        error: "Providers not found"
      })
    }
    return res.json(users)
  }
}

export default new ProviderController();
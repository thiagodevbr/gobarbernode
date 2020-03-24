import * as Yup from "yup";
import User from "../models/User";
import File from "../models/File"

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string()
        .required()
        .min(4),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6)
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: "Validation fails"
      });
    }
    const exists = await User.findOne({
      where: {
        email: req.body.email
      }
    });
    if (exists)
      return res.json({
        message: "Usuario já existe"
      });
    const user = await User.create(req.body);
    return res.json(user);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().min(4),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when("oldPassword", (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when("password", (password, field) =>
        password ? field.required().oneOf([Yup.ref("password")]) : field
      )
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: "Validation fails"
      });
    }

    if (!req.body.avatar_id || req.body.avatar_id === true || typeof req.body.avatar_id === 'string') {
      return res.status(400).json({
        error: "Avatar's field cannot be empty, boolean or a string value."
      })
    }

    const avatar = await File.findByPk(req.body.avatar_id)
    if (!avatar) {
      return res.status(400).json({
        error: "Avatar not found"
      })
    }

    const {
      email,
      oldPassword
    } = req.body;
    const user = await User.findByPk(req.userId);

    if (email && email !== user.email) {
      const exists = await User.findOne({
        where: {
          email
        }
      });
      if (exists)
        return res.json({
          message: "E-mail já existe"
        });
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({
        error: "Password does not match"
      });
    }

    const userUpdate = await user.update(req.body);


    return res.json(userUpdate);
  }

  async getUsers(req, res) {
    const users = await User.findAll();
    return res.json(users);
  }
}

export default new UserController();
const User = require('../models/User');

class UserController {
  async store(req, res) {
    const { email } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ error: 'E-mail já existente' });
    }

    const token = User.generateToken(email);

    const user = await User.create({ ...req.body, token });

    return res.json(user);
  }
}

module.exports = new UserController();

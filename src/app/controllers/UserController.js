const User = require('../models/User');

class UserController {
  async store(req, res) {
    const { email } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ mensagem: 'E-mail já existente' });
    }

    const token = User.generateToken(email);

    const user = await User.create({ ...req.body, token });

    return res.json(user);
  }

  async update(req, res) {
    const { email, senha } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ mensagem: 'Usuário e/ou senha inválidos' });
    }

    if (!(await user.compareHash(senha))) {
      return res.status(401).json({ mensagem: 'Usuário e/ou senha inválidos' });
    }

    const token = User.generateToken(email);
    user.ultimo_login = Date.now();
    user.token = token;

    await user.save();

    return res.json(user);
  }
}

module.exports = new UserController();

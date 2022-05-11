import User from '../models/user.model.js';

export const getAllUsers = async (_req, res) => {
  const users = await User.find();
  res.json(users);
};

export const createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json({ message: 'User created', user });
  } catch (error) {
    res.json({ error, message: 'User not created' });
  }
};

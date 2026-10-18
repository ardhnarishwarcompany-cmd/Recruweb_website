import { Subscriber } from '../models/index.js';

export const subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    const existingSubscriber = await Subscriber.findOne({ where: { email } });
    if (existingSubscriber) {
      if (!existingSubscriber.isActive) {
        existingSubscriber.isActive = true;
        await existingSubscriber.save();
        return res.status(200).json({ success: true, message: 'Welcome back! You have been resubscribed successfully.' });
      }
      return res.status(400).json({ success: false, message: 'You are already subscribed!' });
    }

    const subscriber = await Subscriber.create({ email });
    res.status(201).json({ success: true, message: 'Thank you for subscribing to our newsletter!', data: subscriber });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, message: 'You are already subscribed!' });
    }
    res.status(500).json({ success: false, message: 'Failed to subscribe. Please try again.', error: error.message });
  }
};

export const unsubscribe = async (req, res) => {
  try {
    const { email } = req.params;
    const subscriber = await Subscriber.findOne({ where: { email } });
    if (!subscriber) {
      return res.status(404).json({ success: false, message: 'Subscriber not found' });
    }
    subscriber.isActive = false;
    await subscriber.save();
    res.status(200).json({ success: true, message: 'You have been unsubscribed successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to unsubscribe', error: error.message });
  }
};

export const getSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.findAll({ order: [['subscribedAt', 'DESC']] });
    res.status(200).json({ success: true, count: subscribers.length, data: subscribers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch subscribers', error: error.message });
  }
};

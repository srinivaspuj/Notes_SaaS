import { cors } from '../lib/cors';

function handler(req, res) {
  res.status(200).json({ status: 'ok' });
}

export default cors(handler);
export function cors(handler) {
  return (req, res) => {
    if (res && res.setHeader) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
      
      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
      }
    }
    
    return handler(req, res);
  };
}
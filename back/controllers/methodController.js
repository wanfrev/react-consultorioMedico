const Security = require('../Security');

exports.invokeMethod = async (req, res) => {
  const jsonData = req.body;

  try {
    const security = new Security(req.db);
    const result = await security.invokeMethod(jsonData);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error invoking method' });
  }
};

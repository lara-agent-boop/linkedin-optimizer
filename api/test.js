module.exports = async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  res.status(200).json({
    hasApiKey: !!apiKey,
    keyLength: apiKey ? apiKey.length : 0,
    keyPrefix: apiKey ? apiKey.substring(0, 10) : null,
    env: Object.keys(process.env).filter(k => k.includes('ANTHROPIC') || k.includes('VERCEL'))
  });
};

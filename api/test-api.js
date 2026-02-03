const Anthropic = require("@anthropic-ai/sdk");

module.exports = async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: "No API key" });
  }

  try {
    const client = new Anthropic({ apiKey });
    
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 50,
      messages: [{ role: "user", content: "Say hello" }]
    });
    
    return res.status(200).json({
      success: true,
      response: response.content[0].text
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
      name: err.name,
      stack: err.stack
    });
  }
};

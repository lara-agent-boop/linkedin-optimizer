const Anthropic = require("@anthropic-ai/sdk").default;

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Try to fetch LinkedIn profile (usually blocked, but worth trying)
async function fetchLinkedInProfile(url) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      redirect: "follow",
    });

    if (!response.ok) return null;

    const html = await response.text();

    // LinkedIn usually returns a login wall, check for that
    if (
      html.includes("authwall") ||
      html.includes("login") ||
      html.includes("Sign in")
    ) {
      return null;
    }

    // Try to extract basic profile info from HTML
    // This is fragile but might work for public profiles
    const nameMatch = html.match(/<title>([^|<]+)/);
    const aboutMatch = html.match(
      /About<\/h2>[\s\S]*?<p[^>]*>([^<]+)<\/p>/i
    );

    if (nameMatch) {
      return {
        raw: html.substring(0, 50000), // Limit size
        extracted: true,
      };
    }

    return null;
  } catch (err) {
    console.error("LinkedIn fetch error:", err.message);
    return null;
  }
}

module.exports = async (req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { linkedinUrl, profileContent, targetRole } = req.body;

  // Try to get content from URL if provided
  let content = profileContent;
  let fetchedFromUrl = false;

  if (linkedinUrl && !profileContent) {
    const fetched = await fetchLinkedInProfile(linkedinUrl);
    if (fetched) {
      content = fetched.raw;
      fetchedFromUrl = true;
    } else {
      return res.status(400).json({
        error:
          "Could not fetch LinkedIn profile. LinkedIn blocks automated access. Please paste your profile content manually using the toggle below the URL field.",
        needsPaste: true,
      });
    }
  }

  if (!content) {
    return res.status(400).json({
      error: "Please provide your LinkedIn profile content.",
    });
  }

  const systemPrompt = `You are an expert LinkedIn profile optimizer and personal branding consultant. You help mid-career professionals transform their profiles from forgettable to compelling.

Your expertise includes:
- Writing achievement-focused content that showcases impact
- Crafting headlines that stand out in search results
- Creating narratives that tell a career story
- Optimizing for recruiters AND networking connections
- Understanding what makes profiles rank higher in LinkedIn search

When analyzing profiles, you look for:
- Generic vs. specific language
- Duties vs. achievements
- Missing metrics/impact
- Weak headlines
- Lack of personality/voice
- Missing keywords for target roles
- Poor narrative flow

Your rewrites should:
- Lead with impact and results
- Use specific metrics where possible (estimate reasonably if not provided)
- Tell a story, not list duties
- Include relevant keywords naturally
- Show personality while remaining professional
- Be optimized for the target role if specified`;

  const targetRoleContext = targetRole
    ? `\n\nThe user is targeting this role: "${targetRole}". Tailor your optimizations to appeal to hiring managers and recruiters for this type of position.`
    : "";

  const userPrompt = `Analyze and optimize this LinkedIn profile content:

---
${content}
---
${targetRoleContext}

Respond with a JSON object (no markdown, just valid JSON) with this exact structure:

{
  "score": <number 0-100>,
  "original": {
    "headline": "<extracted original headline or best guess>",
    "about": "<extracted original about section or best guess, first 500 chars>"
  },
  "audit": [
    {
      "category": "Headline",
      "status": "pass|warn|fail",
      "feedback": "<specific feedback>"
    },
    {
      "category": "About Section",
      "status": "pass|warn|fail", 
      "feedback": "<specific feedback>"
    },
    {
      "category": "Achievement Focus",
      "status": "pass|warn|fail",
      "feedback": "<specific feedback>"
    },
    {
      "category": "Keywords & Searchability",
      "status": "pass|warn|fail",
      "feedback": "<specific feedback>"
    },
    {
      "category": "Career Narrative",
      "status": "pass|warn|fail",
      "feedback": "<specific feedback>"
    },
    {
      "category": "Call-to-Action",
      "status": "pass|warn|fail",
      "feedback": "<specific feedback>"
    }
  ],
  "optimized": {
    "headline": "<new compelling headline, max 120 chars>",
    "about": "<new about section, ~1500-2000 chars, with personality and impact>",
    "experience": "<rewritten experience bullets for most recent 2-3 roles, achievement-focused with metrics>",
    "resumeSummary": "<3-4 line resume summary that matches the new LinkedIn narrative>"
  }
}

Guidelines for optimization:
- Headline: Make it specific, include value proposition, avoid generic titles
- About: Start with a hook, tell a story, include achievements, end with CTA
- Experience: STAR format - Situation context, Task, Action, Result with metrics
- Add estimated metrics if none provided (e.g., "team of ~10", "increased by ~20%")
- Keep voice professional but personable - not robotic

Return ONLY valid JSON, no explanation or markdown.`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    const text = response.content[0].text.trim();

    // Parse JSON response
    let result;
    try {
      // Try to extract JSON if wrapped in anything
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr.message);
      console.error("Raw response:", text.substring(0, 500));
      return res.status(500).json({
        error: "Failed to parse optimization results. Please try again.",
      });
    }

    // Validate required fields
    if (!result.score || !result.optimized || !result.audit) {
      return res.status(500).json({
        error: "Incomplete optimization results. Please try again.",
      });
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({
      error: err.message || "Failed to optimize profile",
    });
  }
};

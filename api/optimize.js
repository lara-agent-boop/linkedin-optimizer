const Anthropic = require("@anthropic-ai/sdk");
const pdf = require("pdf-parse");

module.exports = async (req, res) => {
  // Check API key availability
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY not found in environment");
    return res.status(500).json({ error: "API configuration error - missing API key" });
  }

  const client = new Anthropic({ apiKey });

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

  const { pdfBase64, profileContent, targetRole } = req.body;

  let content = profileContent;

  // Parse PDF if provided
  if (pdfBase64) {
    try {
      const pdfBuffer = Buffer.from(pdfBase64, "base64");
      const pdfData = await pdf(pdfBuffer);
      content = pdfData.text;

      if (!content || content.trim().length < 50) {
        return res.status(400).json({
          error:
            "Could not extract text from PDF. The file may be image-based or corrupted. Try pasting your profile content manually.",
        });
      }
    } catch (err) {
      console.error("PDF parse error:", err.message);
      return res.status(400).json({
        error:
          "Failed to parse PDF. Make sure it's a valid LinkedIn profile export. Error: " +
          err.message,
      });
    }
  }

  if (!content) {
    return res.status(400).json({
      error: "Please provide your LinkedIn profile content (PDF or text).",
    });
  }

  const systemPrompt = `You are an expert LinkedIn profile optimizer who understands how recruiters actually use LinkedIn Recruiter (a paid tool different from regular LinkedIn).

## How Recruiters Find You
- Recruiters use LinkedIn Recruiter where they search by: current title, past titles, companies, schools, skills, and keywords across your ENTIRE profile
- They build complex search queries and check them daily
- You need to appear in the first 20-30 results they screen
- LinkedIn shows recruiters a "likelihood to respond" score based on your activity

## What Hiring Managers Check (Above the Fold)
1. **Headshot** - Must be professional
2. **Banner** - Empty banner signals you don't maintain your profile
3. **Headline** - Your statement. NEVER put "seeking opportunities" or "pivoting" - this creates objections. Convey CONFIDENCE.
   - Good example: "Senior Product Manager | 15 years experience | Expert in product management, agile, and go-to-market activation"
   - Include: job title, years of experience, 2-3 key skills/keywords
4. **Professional Summary** - First 3 lines are EVERYTHING. Make them punchy and compelling. Don't repeat your headline - BUILD on it. Hook them here so they read more.
5. **Work Experience** - Don't just list companies and titles. Add descriptions and bullets. The first 2-3 lines before "see more" are crucial. The 5 most recent positions show by default.
6. **Skills Section** - Every skill helps searchability

## For Career Pivoters
- Bridge the language gap between old and new roles
- Talk about transferable activities (e.g., marketing to PM: mention managing projects, rolling out website features)
- Use metrics like activation, conversion, time on site
- Use the LANGUAGE of the target occupation so they see you're familiar
- The professional summary is KEY for pivoters - it's where you make your pitch

## What Makes Profiles Fail
- Generic vs. specific language
- Listing duties instead of achievements
- Missing metrics/impact
- Weak headlines that don't convey value
- Using phrases like "seeking new opportunities" (creates doubt)
- Not having keywords recruiters search for

## Your Rewrites Should
- Lead with impact and results
- Use specific metrics (estimate reasonably if not provided: "team of ~10", "increased by ~25%")
- Tell a story, not list duties
- Include relevant keywords NATURALLY (don't stuff)
- Show personality while remaining professional
- Convey confidence and competence
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
      "category": "Headline Power",
      "status": "pass|warn|fail",
      "feedback": "<Check: Does it convey confidence? Include job title + years + key skills? FAIL if contains 'seeking opportunities' or 'pivoting'>"
    },
    {
      "category": "First 3 Lines (Hook)",
      "status": "pass|warn|fail", 
      "feedback": "<The first 3 lines of the About section are everything - are they punchy and compelling? Do they hook the reader?>"
    },
    {
      "category": "Achievement vs Duties",
      "status": "pass|warn|fail",
      "feedback": "<Are experience bullets focused on achievements with metrics, or just listing job duties?>"
    },
    {
      "category": "Recruiter Keywords",
      "status": "pass|warn|fail",
      "feedback": "<Are there searchable keywords throughout that recruiters would use in LinkedIn Recruiter searches?>"
    },
    {
      "category": "Experience Depth",
      "status": "pass|warn|fail",
      "feedback": "<Do the most recent 2-3 roles have detailed descriptions and bullets? First 2-3 lines before 'see more' are crucial.>"
    },
    {
      "category": "Confidence Signals",
      "status": "pass|warn|fail",
      "feedback": "<Does the profile convey competence and professionalism? No doubt-creating phrases like 'seeking opportunities'?>"
    }
  ],
  "optimized": {
    "headline": "<new compelling headline, max 120 chars>",
    "about": "<new about section, ~600-800 chars MAX, short punchy paragraphs, scannable>",
    "experience": "<rewritten experience bullets for most recent 2-3 roles, achievement-focused with metrics>",
    "resumeSummary": "<3-4 line resume summary that matches the new LinkedIn narrative>"
  }
}

Guidelines for optimization:

HEADLINE (max 120 chars):
- Format: "[Title] | [X years experience] | [2-3 key skills/keywords]"
- Example: "VP Operations | 10+ years scaling startups | Strategy, People Ops, Cross-functional Leadership"
- NEVER include "seeking opportunities", "open to work", or "pivoting" - these create objections
- Convey confidence and value

ABOUT SECTION (~600-800 chars, SHORT and punchy):
- First 3 lines are EVERYTHING - make them compelling hooks
- Don't repeat the headline - BUILD on it
- Keep it scannable - short paragraphs, not walls of text
- 2-3 key achievements with metrics
- End with a soft 1-line CTA
- AVOID: long intros, filler words, generic statements

EXPERIENCE BULLETS:
- Lead with impact and results, not duties
- Include metrics (estimate if needed: "team of ~15", "reduced costs by ~30%")
- First 2-3 bullets of each role are most important (visible before "see more")
- Use action verbs: Led, Built, Drove, Transformed, Scaled, Launched
- Bridge language for career pivoters (connect old experience to new target role)

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
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    
    // More descriptive error for users
    let userError = err.message || "Failed to optimize profile";
    if (err.message === "Connection error.") {
      userError = "Failed to connect to AI service. Please try again in a moment.";
    }
    
    return res.status(500).json({
      error: userError,
      debug: process.env.NODE_ENV !== 'production' ? err.stack : undefined
    });
  }
};

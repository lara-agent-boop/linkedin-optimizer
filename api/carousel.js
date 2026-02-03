const satori = require("satori").default;
const { Resvg } = require("@resvg/resvg-js");

// Fetch font
async function loadFont() {
  const response = await fetch(
    "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.woff"
  );
  return await response.arrayBuffer();
}

async function loadFontRegular() {
  const response = await fetch(
    "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.woff"
  );
  return await response.arrayBuffer();
}

// Generate a single slide as PNG
async function generateSlide(element, fonts) {
  const svg = await satori(element, {
    width: 1080,
    height: 1080,
    fonts,
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1080 },
  });
  const pngData = resvg.render();
  return pngData.asPng();
}

// Slide templates
function coverSlide(data) {
  // Headshot element - either image or placeholder
  const headshotElement = data.headshot
    ? {
        type: "img",
        props: {
          src: data.headshot,
          style: {
            width: "220px",
            height: "220px",
            borderRadius: "110px",
            objectFit: "cover",
            border: "6px solid white",
            marginBottom: "40px",
          },
        },
      }
    : {
        type: "div",
        props: {
          style: {
            width: "200px",
            height: "200px",
            borderRadius: "100px",
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "80px",
            marginBottom: "40px",
          },
          children: "👤",
        },
      };

  return {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #0077b5 0%, #005582 100%)",
        padding: "60px",
      },
      children: [
        headshotElement,
        {
          type: "div",
          props: {
            style: {
              fontSize: "56px",
              fontWeight: "bold",
              color: "white",
              textAlign: "center",
              marginBottom: "20px",
            },
            children: data.name || "Your Name",
          },
        },
        {
          type: "div",
          props: {
            style: {
              fontSize: "32px",
              color: "rgba(255,255,255,0.9)",
              textAlign: "center",
              maxWidth: "900px",
              lineHeight: 1.4,
            },
            children: data.headline || "Professional Headline",
          },
        },
      ],
    },
  };
}

function valueSlide(data) {
  const strengths = data.strengths || [
    "Strategic Leadership",
    "Data-Driven Decisions",
    "Team Building",
  ];

  return {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "white",
        padding: "60px",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              fontSize: "48px",
              fontWeight: "bold",
              color: "#0077b5",
              marginBottom: "50px",
            },
            children: "What I Bring",
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              gap: "30px",
              flex: 1,
            },
            children: strengths.map((strength, i) => ({
              type: "div",
              props: {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: "24px",
                  background: "#f8fafc",
                  padding: "30px 40px",
                  borderRadius: "16px",
                  borderLeft: "6px solid #0077b5",
                },
                children: [
                  {
                    type: "div",
                    props: {
                      style: {
                        fontSize: "36px",
                        fontWeight: "bold",
                        color: "#0077b5",
                      },
                      children: `${i + 1}`,
                    },
                  },
                  {
                    type: "div",
                    props: {
                      style: { fontSize: "32px", color: "#1a202c" },
                      children: strength,
                    },
                  },
                ],
              },
            })),
          },
        },
      ],
    },
  };
}

function metricsSlide(data) {
  const metrics = data.metrics || [
    { value: "10+", label: "Years Experience" },
    { value: "50+", label: "Projects Delivered" },
    { value: "$2M+", label: "Revenue Impact" },
    { value: "100+", label: "Team Members Led" },
  ];

  return {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #1a202c 0%, #2d3748 100%)",
        padding: "60px",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              fontSize: "48px",
              fontWeight: "bold",
              color: "white",
              marginBottom: "50px",
            },
            children: "By The Numbers",
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexWrap: "wrap",
              gap: "30px",
              flex: 1,
              alignContent: "center",
            },
            children: metrics.map((m) => ({
              type: "div",
              props: {
                style: {
                  width: "calc(50% - 15px)",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "20px",
                  padding: "40px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                },
                children: [
                  {
                    type: "div",
                    props: {
                      style: {
                        fontSize: "64px",
                        fontWeight: "bold",
                        color: "#0077b5",
                        marginBottom: "10px",
                      },
                      children: m.value,
                    },
                  },
                  {
                    type: "div",
                    props: {
                      style: {
                        fontSize: "24px",
                        color: "rgba(255,255,255,0.8)",
                        textAlign: "center",
                      },
                      children: m.label,
                    },
                  },
                ],
              },
            })),
          },
        },
      ],
    },
  };
}

function expertiseSlide(data) {
  const skills = data.skills || [
    "Strategy",
    "Operations",
    "Leadership",
    "Analytics",
    "Product",
    "Growth",
  ];

  return {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "white",
        padding: "60px",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              fontSize: "48px",
              fontWeight: "bold",
              color: "#0077b5",
              marginBottom: "50px",
            },
            children: "Areas of Expertise",
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexWrap: "wrap",
              gap: "20px",
              flex: 1,
              alignContent: "center",
              justifyContent: "center",
            },
            children: skills.map((skill) => ({
              type: "div",
              props: {
                style: {
                  background: "#f0f7fb",
                  border: "2px solid #0077b5",
                  borderRadius: "50px",
                  padding: "20px 40px",
                  fontSize: "28px",
                  color: "#0077b5",
                  fontWeight: "bold",
                },
                children: skill,
              },
            })),
          },
        },
      ],
    },
  };
}

function ctaSlide(data) {
  return {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #0077b5 0%, #005582 100%)",
        padding: "60px",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              fontSize: "56px",
              fontWeight: "bold",
              color: "white",
              textAlign: "center",
              marginBottom: "30px",
            },
            children: "Let's Connect!",
          },
        },
        {
          type: "div",
          props: {
            style: {
              fontSize: "32px",
              color: "rgba(255,255,255,0.9)",
              textAlign: "center",
              marginBottom: "50px",
              maxWidth: "800px",
              lineHeight: 1.5,
            },
            children:
              data.cta ||
              "I'm always open to discussing new opportunities and interesting projects.",
          },
        },
        {
          type: "div",
          props: {
            style: {
              background: "white",
              borderRadius: "16px",
              padding: "30px 60px",
              fontSize: "28px",
              color: "#0077b5",
              fontWeight: "bold",
            },
            children: data.linkedin || "linkedin.com/in/yourprofile",
          },
        },
      ],
    },
  };
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, headline, strengths, metrics, skills, cta, linkedin, headshot } =
      req.body;

    const data = { name, headline, strengths, metrics, skills, cta, linkedin, headshot };

    // Load fonts
    const [fontBold, fontRegular] = await Promise.all([
      loadFont(),
      loadFontRegular(),
    ]);

    const fonts = [
      { name: "Inter", data: fontBold, weight: 700, style: "normal" },
      { name: "Inter", data: fontRegular, weight: 400, style: "normal" },
    ];

    // Generate all slides
    const slides = await Promise.all([
      generateSlide(coverSlide(data), fonts),
      generateSlide(valueSlide(data), fonts),
      generateSlide(metricsSlide(data), fonts),
      generateSlide(expertiseSlide(data), fonts),
      generateSlide(ctaSlide(data), fonts),
    ]);

    // Return as base64 array
    const slidesBase64 = slides.map((png) =>
      `data:image/png;base64,${Buffer.from(png).toString("base64")}`
    );

    return res.status(200).json({
      success: true,
      slides: slidesBase64,
    });
  } catch (err) {
    console.error("Carousel error:", err);
    return res.status(500).json({
      error: err.message || "Failed to generate carousel",
    });
  }
};

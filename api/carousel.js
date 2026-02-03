const satori = require("satori").default;
const { Resvg } = require("@resvg/resvg-js");

// Teal brand colors
const COLORS = {
  background: '#FFFFFF',
  tealGreen: '#2DD4BF',
  textDark: '#171717',
  textGray: '#6B7280',
  lightGray: '#F5F5F5',
  accent: '#0D9488'
};

// Fetch fonts
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

// Footer component for all slides
function slideFooter(slideNum, total) {
  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "30px 60px",
        borderTop: "1px solid #E5E7EB",
        marginTop: "auto",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "12px",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: COLORS.tealGreen,
                  },
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: COLORS.textDark,
                  },
                  children: "Teal",
                },
              },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: {
              fontSize: "20px",
              color: COLORS.textGray,
            },
            children: `${slideNum}/${total}`,
          },
        },
      ],
    },
  };
}

// Slide templates
function coverSlide(data, total) {
  const headshotElement = data.headshot
    ? {
        type: "img",
        props: {
          src: data.headshot,
          style: {
            width: "200px",
            height: "200px",
            borderRadius: "100px",
            objectFit: "cover",
            border: `4px solid ${COLORS.tealGreen}`,
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
            background: COLORS.lightGray,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "80px",
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
        background: COLORS.background,
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "60px",
            },
            children: [
              headshotElement,
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "52px",
                    fontWeight: "bold",
                    color: COLORS.textDark,
                    textAlign: "center",
                    marginTop: "30px",
                    marginBottom: "16px",
                  },
                  children: data.name || "Your Name",
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "28px",
                    color: COLORS.textGray,
                    textAlign: "center",
                    maxWidth: "800px",
                    lineHeight: 1.4,
                  },
                  children: data.headline || "Professional Headline",
                },
              },
            ],
          },
        },
        slideFooter(1, total),
      ],
    },
  };
}

function valueSlide(data, total) {
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
        background: COLORS.background,
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              flex: 1,
              display: "flex",
              flexDirection: "column",
              padding: "60px",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "44px",
                    fontWeight: "bold",
                    color: COLORS.textDark,
                    marginBottom: "40px",
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
                    gap: "24px",
                  },
                  children: strengths.map((strength, i) => ({
                    type: "div",
                    props: {
                      style: {
                        display: "flex",
                        alignItems: "center",
                        gap: "20px",
                        background: COLORS.lightGray,
                        padding: "28px 32px",
                        borderRadius: "12px",
                        borderLeft: `5px solid ${COLORS.tealGreen}`,
                      },
                      children: [
                        {
                          type: "div",
                          props: {
                            style: {
                              fontSize: "32px",
                              fontWeight: "bold",
                              color: COLORS.accent,
                            },
                            children: `${i + 1}`,
                          },
                        },
                        {
                          type: "div",
                          props: {
                            style: { fontSize: "28px", color: COLORS.textDark },
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
        },
        slideFooter(2, total),
      ],
    },
  };
}

function metricsSlide(data, total) {
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
        background: COLORS.textDark,
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              flex: 1,
              display: "flex",
              flexDirection: "column",
              padding: "60px",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "44px",
                    fontWeight: "bold",
                    color: COLORS.background,
                    marginBottom: "40px",
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
                    gap: "24px",
                    flex: 1,
                    alignContent: "center",
                  },
                  children: metrics.map((m) => ({
                    type: "div",
                    props: {
                      style: {
                        width: "450px",
                        background: "rgba(255,255,255,0.1)",
                        borderRadius: "16px",
                        padding: "36px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      },
                      children: [
                        {
                          type: "div",
                          props: {
                            style: {
                              fontSize: "56px",
                              fontWeight: "bold",
                              color: COLORS.tealGreen,
                              marginBottom: "8px",
                            },
                            children: m.value,
                          },
                        },
                        {
                          type: "div",
                          props: {
                            style: {
                              fontSize: "22px",
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
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "30px 60px",
              borderTop: "1px solid rgba(255,255,255,0.2)",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          background: COLORS.tealGreen,
                        },
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: "24px",
                          fontWeight: "bold",
                          color: COLORS.background,
                        },
                        children: "Teal",
                      },
                    },
                  ],
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "20px",
                    color: "rgba(255,255,255,0.6)",
                  },
                  children: `3/${total}`,
                },
              },
            ],
          },
        },
      ],
    },
  };
}

function expertiseSlide(data, total) {
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
        background: COLORS.background,
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              flex: 1,
              display: "flex",
              flexDirection: "column",
              padding: "60px",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "44px",
                    fontWeight: "bold",
                    color: COLORS.textDark,
                    marginBottom: "40px",
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
                    gap: "16px",
                    flex: 1,
                    alignContent: "center",
                    justifyContent: "center",
                  },
                  children: skills.map((skill) => ({
                    type: "div",
                    props: {
                      style: {
                        background: COLORS.lightGray,
                        border: `2px solid ${COLORS.tealGreen}`,
                        borderRadius: "50px",
                        padding: "18px 36px",
                        fontSize: "26px",
                        color: COLORS.textDark,
                        fontWeight: "600",
                      },
                      children: skill,
                    },
                  })),
                },
              },
            ],
          },
        },
        slideFooter(4, total),
      ],
    },
  };
}

function ctaSlide(data, total) {
  return {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: COLORS.background,
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "60px",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "52px",
                    fontWeight: "bold",
                    color: COLORS.textDark,
                    textAlign: "center",
                    marginBottom: "24px",
                  },
                  children: "Let's Connect!",
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "28px",
                    color: COLORS.textGray,
                    textAlign: "center",
                    marginBottom: "40px",
                    maxWidth: "700px",
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
                    background: COLORS.tealGreen,
                    borderRadius: "12px",
                    padding: "24px 48px",
                    fontSize: "26px",
                    color: COLORS.textDark,
                    fontWeight: "bold",
                  },
                  children: data.linkedin || "linkedin.com/in/yourprofile",
                },
              },
            ],
          },
        },
        slideFooter(5, total),
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
    const totalSlides = 5;

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
      generateSlide(coverSlide(data, totalSlides), fonts),
      generateSlide(valueSlide(data, totalSlides), fonts),
      generateSlide(metricsSlide(data, totalSlides), fonts),
      generateSlide(expertiseSlide(data, totalSlides), fonts),
      generateSlide(ctaSlide(data, totalSlides), fonts),
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

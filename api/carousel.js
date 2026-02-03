const satori = require("satori").default;
const { Resvg } = require("@resvg/resvg-js");

// Theme definitions
const THEMES = {
  teal: {
    name: 'Teal',
    background: '#FFFFFF',
    backgroundAlt: '#171717',
    primary: '#2DD4BF',
    accent: '#0D9488',
    textDark: '#171717',
    textLight: '#FFFFFF',
    textGray: '#6B7280',
    lightGray: '#F5F5F5',
    cardBg: 'rgba(255,255,255,0.1)',
    brandName: 'Teal'
  },
  dark: {
    name: 'Dark',
    background: '#0F172A',
    backgroundAlt: '#1E293B',
    primary: '#38BDF8',
    accent: '#0EA5E9',
    textDark: '#F1F5F9',
    textLight: '#FFFFFF',
    textGray: '#94A3B8',
    lightGray: '#1E293B',
    cardBg: 'rgba(255,255,255,0.05)',
    brandName: 'Teal'
  },
  ocean: {
    name: 'Ocean',
    background: '#FFFFFF',
    backgroundAlt: '#0C4A6E',
    primary: '#0284C7',
    accent: '#0369A1',
    textDark: '#0C4A6E',
    textLight: '#FFFFFF',
    textGray: '#64748B',
    lightGray: '#F0F9FF',
    cardBg: 'rgba(255,255,255,0.1)',
    brandName: 'Teal'
  },
  sunset: {
    name: 'Sunset',
    background: '#FFFFFF',
    backgroundAlt: '#7C2D12',
    primary: '#F97316',
    accent: '#EA580C',
    textDark: '#431407',
    textLight: '#FFFFFF',
    textGray: '#78716C',
    lightGray: '#FFF7ED',
    cardBg: 'rgba(255,255,255,0.1)',
    brandName: 'Teal'
  },
  forest: {
    name: 'Forest',
    background: '#FFFFFF',
    backgroundAlt: '#14532D',
    primary: '#22C55E',
    accent: '#16A34A',
    textDark: '#14532D',
    textLight: '#FFFFFF',
    textGray: '#6B7280',
    lightGray: '#F0FDF4',
    cardBg: 'rgba(255,255,255,0.1)',
    brandName: 'Teal'
  }
};

// Default to teal theme
function getTheme(themeName) {
  return THEMES[themeName] || THEMES.teal;
}

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
function slideFooter(slideNum, total, theme, isDark = false) {
  const textColor = isDark ? theme.textLight : theme.textDark;
  const grayColor = isDark ? 'rgba(255,255,255,0.6)' : theme.textGray;
  const borderColor = isDark ? 'rgba(255,255,255,0.2)' : '#E5E7EB';
  
  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "30px 60px",
        borderTop: `1px solid ${borderColor}`,
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
                    background: theme.primary,
                  },
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: textColor,
                  },
                  children: theme.brandName,
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
              color: grayColor,
            },
            children: `${slideNum}/${total}`,
          },
        },
      ],
    },
  };
}

// Slide templates
function coverSlide(data, total, theme) {
  const isDarkTheme = theme.background !== '#FFFFFF';
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
            border: `4px solid ${theme.primary}`,
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
            background: theme.lightGray,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "72px",
            color: theme.textGray,
          },
          children: "?",
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
        background: theme.background,
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
                    color: theme.textDark,
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
                    color: theme.textGray,
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
        slideFooter(1, total, theme, isDarkTheme),
      ],
    },
  };
}

function valueSlide(data, total, theme) {
  const isDarkTheme = theme.background !== '#FFFFFF';
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
        background: theme.background,
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
                    color: theme.textDark,
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
                        background: theme.lightGray,
                        padding: "28px 32px",
                        borderRadius: "12px",
                        borderLeft: `5px solid ${theme.primary}`,
                      },
                      children: [
                        {
                          type: "div",
                          props: {
                            style: {
                              fontSize: "32px",
                              fontWeight: "bold",
                              color: theme.accent,
                            },
                            children: `${i + 1}`,
                          },
                        },
                        {
                          type: "div",
                          props: {
                            style: { fontSize: "28px", color: theme.textDark },
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
        slideFooter(2, total, theme, isDarkTheme),
      ],
    },
  };
}

function metricsSlide(data, total, theme) {
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
        background: theme.backgroundAlt,
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
                    color: theme.textLight,
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
                        background: theme.cardBg,
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
                              color: theme.primary,
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
        slideFooter(3, total, theme, true),
      ],
    },
  };
}

function expertiseSlide(data, total, theme) {
  const isDarkTheme = theme.background !== '#FFFFFF';
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
        background: theme.background,
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
                    color: theme.textDark,
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
                        background: theme.lightGray,
                        border: `2px solid ${theme.primary}`,
                        borderRadius: "50px",
                        padding: "18px 36px",
                        fontSize: "26px",
                        color: theme.textDark,
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
        slideFooter(4, total, theme, isDarkTheme),
      ],
    },
  };
}

function ctaSlide(data, total, theme) {
  const isDarkTheme = theme.background !== '#FFFFFF';
  return {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: theme.background,
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
                    color: theme.textDark,
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
                    color: theme.textGray,
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
                    background: theme.primary,
                    borderRadius: "12px",
                    padding: "24px 48px",
                    fontSize: "26px",
                    color: isDarkTheme ? theme.textLight : theme.textDark,
                    fontWeight: "bold",
                  },
                  children: data.linkedin || "linkedin.com/in/yourprofile",
                },
              },
            ],
          },
        },
        slideFooter(5, total, theme, isDarkTheme),
      ],
    },
  };
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // GET request returns available themes
  if (req.method === "GET") {
    return res.status(200).json({
      themes: Object.entries(THEMES).map(([id, t]) => ({
        id,
        name: t.name,
        primary: t.primary,
        background: t.background,
        backgroundAlt: t.backgroundAlt
      }))
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, headline, strengths, metrics, skills, cta, linkedin, headshot, theme: themeName } =
      req.body;

    const theme = getTheme(themeName);
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

    // Generate all slides with theme
    const slides = await Promise.all([
      generateSlide(coverSlide(data, totalSlides, theme), fonts),
      generateSlide(valueSlide(data, totalSlides, theme), fonts),
      generateSlide(metricsSlide(data, totalSlides, theme), fonts),
      generateSlide(expertiseSlide(data, totalSlides, theme), fonts),
      generateSlide(ctaSlide(data, totalSlides, theme), fonts),
    ]);

    // Return as base64 array
    const slidesBase64 = slides.map((png) =>
      `data:image/png;base64,${Buffer.from(png).toString("base64")}`
    );

    return res.status(200).json({
      success: true,
      theme: theme.name,
      slides: slidesBase64,
    });
  } catch (err) {
    console.error("Carousel error:", err);
    return res.status(500).json({
      error: err.message || "Failed to generate carousel",
    });
  }
};

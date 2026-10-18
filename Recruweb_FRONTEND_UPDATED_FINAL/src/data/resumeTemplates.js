export const SAMPLE_PREVIEW_DATA = {
  personal: {
    fullName: "Aarav Sharma",
    headline: "Senior Product Manager",
    email: "aarav.sharma@email.com",
    phone: "+91 98765 43210",
    location: "Bengaluru, India",
    linkedin: "linkedin.com/in/aaravsharma",
    website: "aaravsharma.dev",
  },
  summary:
    "Product leader with 8+ years building B2B SaaS platforms used by 2M+ users. Led cross-functional teams to ship 40+ releases, growing ARR by 65% in two years.",
  experience: [
    {
      jobTitle: "Senior Product Manager",
      company: "Nimbus Cloud Technologies",
      location: "Bengaluru, India",
      startDate: "2022",
      endDate: "Present",
      current: true,
      description: "",
      bullets: [
        "Increased activation rate by 34% by redesigning the onboarding flow",
        "Led a team of 12 engineers and designers across 3 product lines",
        "Grew ARR from $4.2M to $6.9M within two fiscal years",
      ],
    },
    {
      jobTitle: "Product Manager",
      company: "Verta Systems",
      location: "Pune, India",
      startDate: "2019",
      endDate: "2022",
      current: false,
      description: "",
      bullets: [
        "Shipped 25+ features based on customer discovery interviews",
        "Reduced churn by 18% through a proactive retention program",
      ],
    },
  ],
  education: [
    {
      degree: "MBA, Marketing & Strategy",
      institution: "Indian Institute of Management - Ahmedabad",
      location: "Ahmedabad",
      startDate: "2017",
      endDate: "2019",
      grade: "3.8 GPA",
    },
  ],
  skills: [
    "Product Strategy",
    "Roadmapping",
    "SQL",
    "Figma",
    "A/B Testing",
    "Agile/Scrum",
    "Stakeholder Management",
  ],
  projects: [
    {
      name: "Self-serve Billing Revamp",
      description: "Owned end-to-end redesign cutting support tickets by 40%.",
      techStack: "Stripe, React",
    },
  ],
  certifications: [
    {
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2023",
    },
  ],
  languages: [
    { name: "English", level: "Fluent" },
    { name: "Hindi", level: "Native" },
  ],
  achievements: ["Employee of the Year - 2023"],
};

const resumeTemplates = [
  {
    id: "palette-modern",
    name: "Palette Modern",
    category: "Doctor / Corporate",
    description:
      "A gorgeous pastel-bordered layout with structured side compartments for precise skill and contact indexing.",
    bestFor: "Healthcare, Corporate, Management",
    defaultAccent: "#3B5998",
  },
  {
    id: "executive-classic",
    name: "Executive Classic",
    category: "Executive",
    description:
      "A traditional, serif-accented layout designed to project authority, seniority, and extensive leadership experience.",
    bestFor: "Executives, Finance, Legal",
    defaultAccent: "#1F2937",
  },
  {
    id: "creative-sidebar",
    name: "Creative Sidebar",
    category: "Designer / Creative",
    description:
      "Striking left-hand block structure designed to capture modern recruiter attention instantly.",
    bestFor: "Design, Marketing, Media",
    defaultAccent: "#0F766E",
  },
  {
    id: "bold-header",
    name: "Bold Header Banner",
    category: "Sales & Tech",
    description:
      "Features a prominent top header banner block, making your name and core headline stand out cleanly.",
    bestFor: "Sales, Client-facing roles",
    defaultAccent: "#B91C1C",
  },
  {
    id: "minimal-clean",
    name: "Minimal Clean",
    category: "Minimalist",
    description:
      "Whitespace-focused elegant typography layout giving hiring managers a frictionless reading experience.",
    bestFor: "Consulting, Product, Strategy",
    defaultAccent: "#4F46E5",
  },
  {
    id: "tech-compact",
    name: "Tech Compact",
    category: "Engineering",
    description:
      "Dense information layout engineered for software developers and data specialists to highlight tech stack.",
    bestFor: "Software Engineering, Data Science",
    defaultAccent: "#047857",
  },
];

export default resumeTemplates;

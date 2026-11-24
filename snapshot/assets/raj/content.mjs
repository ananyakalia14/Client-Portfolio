export const person = {
  name: "Raj Mane",
  title: "Raj Mane · AI, Computer Vision & Full-Stack Developer",
  description: "Selected work and experiments by Raj Mane, a computer science engineering student building practical AI, computer vision, and full-stack applications.",
  byline: "AI, computer vision & full-stack development.",
  ticker: "COMPUTER VISION • FULL-STACK DEVELOPMENT • 3× HACKATHON WINNER",
  linkedin: "https://www.linkedin.com/in/raj-mane-268a95371/",
  github: "https://github.com/RAJ-MANE",
  leetcode: "https://leetcode.com/u/Raj-Mane/",
  email: "mailto:rmane9313@gmail.com",
  resume: "/raj/resume.pdf",
};

export const projects = {
  "product-hunt": {
    title: "Improvyu AI Interview Prep", short: "Improvyu AI", color: "#25213e", image: "interview.png",
    alternate: "interview-analysis.png", demo: "https://model-forge-frontend-snowy.vercel.app/", code: "https://github.com/RAJ-MANE/MODEL_FORGE",
    lines: ["Build confidence", "with", "Improvyu AI"],
    tags: ["Multimodal AI", "Next.js", "Python", "TensorFlow", "WebSockets"],
    intro: [
      "Improvyu is a full-stack interview preparation platform for practicing with AI-generated questions.",
      "The project combines facial expression analysis, voice signals, and generated questions in a single interview flow.",
      "The goal was to make it easy to practice a response and review the signals captured during the session.",
    ],
    sections: [
      ["An interview in the browser", "The web interface brings question prompts, the video feed, and analysis together.", "A browser session carries the experience from the first prompt through to review."],
      ["Working with video and voice", "The platform analyzes facial expressions and voice signals during practice.", "The analysis view makes those signals available alongside the interview session."],
      ["Connecting the pieces", "The application combines a Next.js interface with a Python and TensorFlow back end.", "WebSockets connect the live session to the analysis pipeline."],
      ["Generated interview questions", "AI-generated prompts drive the practice session and give the user a question to work through."],
      ["Try the project", "Open the demo to explore the interface, or read the code to see how the frontend and analysis pipeline connect."],
    ],
    captions: ["Interface and analysis", "Interview flow", "Project links", "Source and demo"],
  },
  "bring-whimsy-and-visitors-to-a-very-B2B-booth": {
    title: "Renewable Energy Optimizer", short: "Renewable Energy", color: "#284b40", image: "energy.png",
    alternate: "energy-architecture.jpeg", demo: "https://ai-sun-wind-planner.vercel.app", code: "https://github.com/RAJ-MANE/Renewable_Site_Optimizer",
    lines: ["Finding", "better sites", "for clean", "energy"],
    tags: ["Applied AI", "Clean Energy", "Python", "TensorFlow"],
    intro: [
      "The Renewable Energy Optimizer helps compare candidate sites for solar and wind installations.",
      "It combines historical weather data, geographic coordinates, and terrain elevation to estimate where an installation could work.",
    ],
    sections: [
      ["How it works", "The pipeline brings weather and terrain data into a single analysis, then compares the suitability of candidate locations."],
      ["What it helps you compare", "The platform presents model output so locations can be reviewed against the inputs used to assess them."],
    ],
    captions: ["The project interface and system architecture", "Inputs used to compare candidate sites"],
  },
  "comic-strip-in-a-drip": {
    title: "Air Paint Web App", short: "Air Paint", color: "#46252a", image: "air-paint.webp",
    alternate: "air-paint-pipeline.webp", demo: "https://github.com/RAJ-MANE", code: "https://github.com/RAJ-MANE",
    lines: ["I turned", "motion", "into drawing"],
    tags: ["Computer Vision", "OpenCV", "MediaPipe"],
    intro: [
      "Air Paint is a browser-based drawing tool that uses camera input and hand landmarks as its controller.",
      "With a local camera feed, it tracks a fingertip and maps its position to the drawing canvas.",
    ],
    sections: [
      ["Camera input", "The first step is capturing a frame from the local camera. OpenCV handles that input."],
      ["Hand landmarks", "MediaPipe identifies the hand landmarks and provides the fingertip position for each frame."],
      ["Drawing on the canvas", "The fingertip coordinates map to the drawing surface, where motion becomes a stroke."],
      ["Under the hood", "The project uses Python, Flask, OpenCV, MediaPipe, and NumPy."],
      ["What the prototype shows", "A camera and a hand can act as the input device for an interactive drawing interface."],
    ],
    captions: ["Drawing interface concept", "Tracking pipeline"],
  },
  fit: {
    title: "Fit In Fit Out", short: "Fit In Fit Out", color: "#453253", image: "fit.webp",
    demo: "https://fit-in-fit-out.vercel.app/", code: "https://github.com/RAJ-MANE",
  },
};

export const history = [
  "I’m pursuing a bachelor’s degree in Computer Science Engineering at Thakur College of Engineering and Technology, Mumbai.",
  "At TCET I’ve built a foundation in programming, software engineering, and machine learning.",
  "I earned a 9.88/10 CGPA while building projects alongside my coursework.",
  "I joined the ISTE TCET student chapter in June 2024 and contributed to workshops and campus technology initiatives.",
  "At Cyber Peace Foundation, I researched cybersecurity frameworks and digital trust during a 2024 internship.",
  "I also assisted with threat intelligence analysis and digital safety awareness during that internship.",
  "I received training in Java through IIT Bombay’s Spoken Tutorial program.",
  "I built Air Paint to experiment with gesture-based drawing using a local camera.",
  "At GenerationTech 2025, I won a national hackathon focused on building technology for social good.",
  "I won Model Forge 2025, a competition focused on model architecture and inference optimization.",
  "I won the NEXUS AI Challenge for work in multimodal AI.",
  "As Technical Head of the Axios EDIC TCET E-Cell, I led full-stack development on digital portals.",
  "I worked on code reviews, architecture guidelines, and hosting for the student team.",
  "During my internship at Dilatio & Co., I built workflow automations with n8n and API integrations.",
  "I also assisted with deploying AI automation models and web-based management tools.",
  "Today I’m exploring where computer vision, robotics, and the web can come together.",
];

export const gallery = [
  ["interview.png", "Improvyu interview interface"],
  ["interview-analysis.png", "Improvyu analysis view"],
  ["energy.png", "Renewable Energy Optimizer interface"],
  ["energy-architecture.jpeg", "Renewable Energy Optimizer architecture"],
  ["air-paint.webp", "Air Paint interface concept"],
  ["air-paint-pipeline.webp", "Air Paint tracking pipeline"],
  ["generationtech.jpeg", "GenerationTech certificate"],
  ["model-forge.jpeg", "Model Forge certificate"],
  ["nexus-ai.jpeg", "NEXUS AI certificate"],
  ["ai-model-building.jpeg", "AI Model Building certificate"],
  ["edic.jpeg", "Axios EDIC TCET E-Cell"],
  ["cyberpeace.jpeg", "Cyber Peace Foundation"],
  ["iste.jpeg", "ISTE TCET"],
  ["dilatio.jpeg", "Dilatio & Co."],
  ["fit.webp", "Fit In Fit Out project card"],
  ["ancient.webp", "Ancient Melodies Studio"],
];


export const experiences = [
  {
    role: "Student Member",
    organization: "ISTE TCET",
    period: "Jun 2024 – Present",
    logo: "iste.jpeg",
    details: [
      "Took part in technical workshops and peer mentorship at TCET.",
      "Collaborated on campus technology initiatives and hackathons with the ISTE student chapter.",
    ],
  },
  {
    role: "Cyber Security Intern",
    organization: "Cyber Peace Foundation",
    period: "Nov 2024 – Dec 2024",
    logo: "cyberpeace.jpeg",
    details: [
      "Researched cybersecurity frameworks, digital trust, and online safety.",
      "Assisted with threat intelligence analysis and digital safety awareness campaigns.",
    ],
  },
  {
    role: "Technical Head",
    organization: "Axios EDIC TCET E-Cell",
    period: "Jun 2025 – Jun 2026",
    logo: "edic.jpeg",
    details: [
      "Led full-stack development for the E-Cell’s websites and digital portals.",
      "Managed code reviews, architecture guidelines, and hosting for the student team.",
    ],
  },
  {
    role: "Tech Intern",
    organization: "Dilatio & Co.",
    period: "Jan 2026 – Apr 2026",
    logo: "dilatio.jpeg",
    details: [
      "Built n8n workflows and integrated APIs for content scheduling.",
      "Helped deploy custom AI automation models and web-based business management tools.",
    ],
  },
];

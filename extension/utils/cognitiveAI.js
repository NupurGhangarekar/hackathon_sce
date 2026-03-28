/**
 * Cognitive Resume AI - Mock AI function to generate smart summaries
 * Analyzes URL and title to understand user intent
 */

export function generateCognitiveResume(title, url) {
  const urlLower = url.toLowerCase();
  const titleLower = title.toLowerCase();
  
  // Combine for analysis
  const fullContext = `${title} ${url}`.toLowerCase();
  
  let activity = "";
  let intent = "";
  let category = "";

  // YouTube - Learning/Entertainment
  if (urlLower.includes("youtube.com")) {
    const keywords = extractKeywords(title);
    if (keywords.some(k => ["programming", "coding", "tutorial", "learn"].some(w => k.includes(w)))) {
      activity = "watching educational content";
      intent = "learning programming or technical skills";
      category = "📚 Learning";
    } else if (keywords.some(k => ["music", "song", "artist"].some(w => k.includes(w)))) {
      activity = "listening to music";
      intent = "entertainment or background music";
      category = "🎵 Entertainment";
    } else {
      activity = "watching video content";
      intent = "learning or entertainment";
      category = "🎬 Video";
    }
  }

  // Google Docs/Sheets - Working
  else if (urlLower.includes("docs.google.com") || urlLower.includes("sheets.google.com")) {
    if (urlLower.includes("sheets")) {
      activity = "working with spreadsheet data";
      intent = "analyzing, calculating, or organizing data";
      category = "📊 Spreadsheet";
    } else {
      activity = "writing or editing a document";
      intent = "creating or reviewing written content";
      category = "📝 Document";
    }
  }

  // GitHub - Development
  else if (urlLower.includes("github.com")) {
    if (urlLower.includes("pull") || urlLower.includes("pr")) {
      activity = "reviewing code changes";
      intent = "code review and quality assurance";
      category = "🔍 Code Review";
    } else if (urlLower.includes("issues")) {
      activity = "managing project issues";
      intent = "bug tracking and project management";
      category = "🐛 Issues";
    } else {
      activity = "browsing or working with code repositories";
      intent = "development or contributing to projects";
      category = "💻 Development";
    }
  }

  // Stack Overflow - Problem Solving
  else if (urlLower.includes("stackoverflow.com")) {
    activity = "searching for programming solutions";
    intent = "debugging or learning programming concepts";
    category = "🔧 Problem Solving";
  }

  // Gmail - Communication
  else if (urlLower.includes("gmail.com") || urlLower.includes("mail.google.com")) {
    activity = "managing emails";
    intent = "communication or reviewing messages";
    category = "📧 Communication";
  }

  // Slack - Collaboration
  else if (urlLower.includes("slack.com")) {
    activity = "communicating with team";
    intent = "collaboration and team coordination";
    category = "💬 Collaboration";
  }

  // Figma - Design
  else if (urlLower.includes("figma.com")) {
    activity = "working on design mockups";
    intent = "UI/UX design or prototyping";
    category = "🎨 Design";
  }

  // LinkedIn - Professional Networking
  else if (urlLower.includes("linkedin.com")) {
    activity = "browsing professional content";
    intent = "networking or job searching";
    category = "🤝 Networking";
  }

  // Notion - Note Taking
  else if (urlLower.includes("notion.so")) {
    activity = "organizing notes and tasks";
    intent = "productivity and knowledge management";
    category = "📋 Notes";
  }

  // Jira - Project Management
  else if (urlLower.includes("jira")) {
    activity = "tracking project tasks";
    intent = "project management and sprint planning";
    category = "📌 Project Mgmt";
  }

  // Medium/Blog - Reading
  else if (urlLower.includes("medium.com") || urlLower.includes("dev.to") || urlLower.includes("blog")) {
    activity = "reading technical articles";
    intent = "learning from industry insights";
    category = "📖 Reading";
  }

  // Twitter/Social - Social Media
  else if (urlLower.includes("twitter.com") || urlLower.includes("x.com") || urlLower.includes("reddit.com")) {
    activity = "browsing social media";
    intent = "staying updated or taking a break";
    category = "📱 Social";
  }

  // Default
  else {
    const titleWords = extractKeywords(title);
    activity = titleWords.length > 0 ? `working on: ${titleWords.join(", ")}` : "browsing the web";
    intent = "general web browsing";
    category = "🌐 Browse";
  }

  return {
    category,
    activity,
    intent,
    summary: `You were ${activity}.\nLikely intent: ${intent}.`,
    confidence: 0.85 + Math.random() * 0.15, // 85-100% confidence
  };
}

/**
 * Extract keywords from title
 */
function extractKeywords(title) {
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by",
    "from", "is", "are", "was", "were", "be", "being", "have", "has", "had", "do", "does", "did"
  ]);

  return title
    .split(/[\s\-_|•]+/)
    .map(word => word.trim().toLowerCase())
    .filter(word => word.length > 3 && !stopWords.has(word))
    .slice(0, 3); // Top 3 keywords
}

/**
 * Format the resume as human-readable text
 */
export function formatResume(resume) {
  return `${resume.category} ${resume.summary}`;
}

/**
 * Get emoji for category
 */
export function getCategoryEmoji(category) {
  const match = category.match(/^([\p{Emoji}])/u);
  return match ? match[0] : "🌐";
}

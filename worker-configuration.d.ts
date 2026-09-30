interface Env {
  RUNNING_IN_DOCKER: Settings;
  DEFAULT_NUM_CTX: Settings;
  ANTHROPIC_API_KEY: string;
  OPENAI_API_KEY: string;
  GROQ_API_KEY: string;
  HuggingFace_API_KEY: string;
  OPEN_ROUTER_API_KEY: string;
  OLLAMA_API_BASE_URL: string;
  OPENAI_LIKE_API_KEY: string;
  OPENAI_LIKE_API_BASE_URL: string;
  TOGETHER_API_KEY: string;
  TOGETHER_API_BASE_URL: string;
  DEEPSEEK_API_KEY: string;
  LMSTUDIO_API_BASE_URL: string;
  GOOGLE_GENERATIVE_AI_API_KEY: string;
  MISTRAL_API_KEY: string;
  XAI_API_KEY: string;
  /** Google OAuth (CybrBuild) — redirect flow only */
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  /** Session cookie signing; SESSION_SECRET accepted as alias */
  AUTH_SECRET: string;
  SESSION_SECRET: string;
  /** Production origin lock: https://build.cybrflux.online */
  APP_URL: string;
  AUTH_URL: string;
  /** When "true", future hard-gate for /api/chat (off by default) */
  AUTH_REQUIRED: string;
  PERPLEXITY_API_KEY: string;
  AWS_BEDROCK_CONFIG: string;
}

import { env } from '../config/env';

interface GithubRepo {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  topics: string[];
  language: string | null;
}

interface GithubReadme {
  content: string;
  encoding: string;
}

export interface ImportedProject {
  title_fr: string;
  title_en: string;
  short_description_fr: string;
  short_description_en: string;
  description_fr: string;
  description_en: string;
  technologies: string;
  category: string;
  demo_url: string;
  repo_url: string;
}

function parseGithubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/.*)?$/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

async function fetchGithub<T>(path: string): Promise<T> {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'portfolio-admin' },
  });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json() as Promise<T>;
}

function decodeBase64(str: string): string {
  return Buffer.from(str.replace(/\s/g, ''), 'base64').toString('utf-8');
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max) + '…';
}

function detectCategory(topics: string[], language: string | null): string {
  const all = [...topics, language || ''].map(t => t.toLowerCase());
  if (all.some(t => ['android', 'ios', 'react-native', 'flutter', 'mobile', 'swift', 'kotlin'].includes(t))) return 'mobile';
  if (all.some(t => ['cli', 'tool', 'devtool', 'automation', 'script', 'library', 'npm'].includes(t))) return 'tools';
  return 'web';
}

async function callLLM(prompt: string): Promise<string> {
  const useMistral = !!env.MISTRAL_API_KEY;
  const useOpenRouter = !!env.OPENROUTER_API_KEY;

  if (!useMistral && !useOpenRouter) {
    throw new Error('Aucune clé LLM configurée (MISTRAL_API_KEY ou OPENROUTER_API_KEY)');
  }

  const url = useMistral
    ? 'https://api.mistral.ai/v1/chat/completions'
    : 'https://openrouter.ai/api/v1/chat/completions';

  const apiKey = useMistral ? env.MISTRAL_API_KEY : env.OPENROUTER_API_KEY;

  const model = env.AI_MODEL || (useMistral ? 'mistral-small-latest' : 'mistralai/mistral-small-3.1-24b-instruct:free');

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
  if (!useMistral) headers['HTTP-Referer'] = 'https://portfolio-admin';

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as Record<string, unknown>;
    throw new Error(`LLM error (${useMistral ? 'Mistral' : 'OpenRouter'}): ${res.status} — ${JSON.stringify(err)}`);
  }

  const data = await res.json() as { choices: { message: { content: string } }[] };
  return data.choices[0].message.content;
}

export async function importFromGithub(repoUrl: string): Promise<ImportedProject> {
  const parsed = parseGithubUrl(repoUrl);
  if (!parsed) throw new Error('URL GitHub invalide. Format attendu : https://github.com/owner/repo');

  const { owner, repo } = parsed;

  const [repoData, readmeData] = await Promise.all([
    fetchGithub<GithubRepo>(`/repos/${owner}/${repo}`),
    fetchGithub<GithubReadme>(`/repos/${owner}/${repo}/readme`).catch(() => null),
  ]);

  const readme = readmeData ? truncate(decodeBase64(readmeData.content), 3000) : '';
  const category = detectCategory(repoData.topics, repoData.language);

  const prompt = `Tu es un assistant qui génère des fiches de projets pour un portfolio de développeur.

Voici les informations d'un repo GitHub :
- Nom : ${repoData.name}
- Description : ${repoData.description || 'Aucune'}
- Langage principal : ${repoData.language || 'Non spécifié'}
- Topics : ${repoData.topics.join(', ') || 'Aucun'}
- README (extrait) :
${readme || 'Pas de README disponible'}

Génère une fiche projet en JSON avec exactement ces champs :
{
  "title_fr": "Titre court en français (max 50 caractères)",
  "title_en": "Short title in English (max 50 chars)",
  "short_description_fr": "Description courte en français (1-2 phrases, max 120 caractères)",
  "short_description_en": "Short description in English (1-2 sentences, max 120 chars)",
  "description_fr": "Description longue en français (3-5 phrases, présente le projet, ses fonctionnalités et technologies clés)",
  "description_en": "Long description in English (3-5 sentences)",
  "technologies": "Tableau JSON des technologies comme chaîne, ex: \\"[\\"Vue 3\\",\\"Node.js\\",\\"SQLite\\"]\\"",
}

Réponds UNIQUEMENT avec le JSON, sans texte supplémentaire.`;

  const raw = await callLLM(prompt);
  const llmResult = JSON.parse(raw) as Record<string, string>;

  return {
    title_fr: llmResult.title_fr || repoData.name,
    title_en: llmResult.title_en || repoData.name,
    short_description_fr: llmResult.short_description_fr || repoData.description || '',
    short_description_en: llmResult.short_description_en || repoData.description || '',
    description_fr: llmResult.description_fr || '',
    description_en: llmResult.description_en || '',
    technologies: llmResult.technologies || JSON.stringify(repoData.topics.slice(0, 8)),
    category,
    demo_url: repoData.homepage || '',
    repo_url: repoData.html_url,
  };
}

import { env } from '../config/env';

interface GithubRepo {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  topics: string[];
  language: string | null;
  default_branch: string;
}

interface GithubReadme {
  content: string;
  encoding: string;
}

interface GithubTree {
  tree: { path: string; type: string }[];
  truncated: boolean;
}

interface GithubContent {
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

const NOTABLE_CONFIGS = new Set([
  'package.json', 'yarn.lock', 'pnpm-lock.yaml',
  'requirements.txt', 'Pipfile', 'pyproject.toml', 'setup.py', 'setup.cfg',
  'Cargo.toml', 'go.mod',
  'pom.xml', 'build.gradle', 'build.gradle.kts',
  'composer.json', 'Gemfile', 'mix.exs',
  'Dockerfile', 'docker-compose.yml', 'docker-compose.yaml',
  'Makefile', 'CMakeLists.txt',
  'tsconfig.json', 'jsconfig.json',
  'vite.config.ts', 'vite.config.js', 'webpack.config.js',
  'next.config.js', 'next.config.ts', 'nuxt.config.ts',
  'angular.json', 'svelte.config.js', 'astro.config.mjs',
  'tailwind.config.js', 'tailwind.config.ts',
  '.eslintrc.json', '.eslintrc.js',
  'pubspec.yaml',
]);

async function fetchRepoTree(owner: string, repo: string, branch: string): Promise<string[]> {
  try {
    const data = await fetchGithub<GithubTree>(
      `/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
    );
    return data.tree
      .filter(item => item.type === 'blob')
      .map(item => item.path)
      .slice(0, 1000);
  } catch {
    return [];
  }
}

function analyzeTree(paths: string[]): { extensions: string[]; configFiles: string[]; rootDirs: string[] } {
  const extCount: Record<string, number> = {};
  const configFiles: string[] = [];
  const rootDirsSet = new Set<string>();

  for (const path of paths) {
    const parts = path.split('/');
    if (parts.length > 1) rootDirsSet.add(parts[0]);

    const filename = parts[parts.length - 1];
    if (parts.length === 1 && NOTABLE_CONFIGS.has(filename)) configFiles.push(filename);

    const dotIdx = filename.lastIndexOf('.');
    if (dotIdx > 0) {
      const ext = filename.slice(dotIdx + 1).toLowerCase();
      if (ext.length >= 1 && ext.length <= 6 && !/^(lock|sum|snap|min)$/.test(ext)) {
        extCount[ext] = (extCount[ext] || 0) + 1;
      }
    }
  }

  const extensions = Object.entries(extCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([ext]) => ext);

  return { extensions, configFiles, rootDirs: Array.from(rootDirsSet).slice(0, 20) };
}

async function fetchManifest(owner: string, repo: string): Promise<string> {
  const candidates = [
    { path: '/package.json', label: 'package.json' },
    { path: '/requirements.txt', label: 'requirements.txt' },
    { path: '/Cargo.toml', label: 'Cargo.toml' },
    { path: '/go.mod', label: 'go.mod' },
    { path: '/pyproject.toml', label: 'pyproject.toml' },
    { path: '/pom.xml', label: 'pom.xml' },
    { path: '/composer.json', label: 'composer.json' },
    { path: '/pubspec.yaml', label: 'pubspec.yaml' },
  ];

  for (const { path, label } of candidates) {
    try {
      const data = await fetchGithub<GithubContent>(`/repos/${owner}/${repo}/contents${path}`);
      const content = truncate(decodeBase64(data.content), 2000);
      return `=== ${label} ===\n${content}`;
    } catch {
      continue;
    }
  }
  return '';
}

function detectCategory(topics: string[], language: string | null, extensions: string[]): string {
  const all = [...topics, language || '', ...extensions].map(t => t.toLowerCase());
  if (all.some(t => ['android', 'ios', 'react-native', 'flutter', 'mobile', 'swift', 'kotlin', 'dart'].includes(t))) return 'mobile';
  if (all.some(t => ['cli', 'tool', 'devtool', 'automation', 'script', 'library', 'npm', 'sh', 'bash'].includes(t))) return 'tools';
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

  const repoData = await fetchGithub<GithubRepo>(`/repos/${owner}/${repo}`);

  const [readmeData, treePaths, manifest] = await Promise.all([
    fetchGithub<GithubReadme>(`/repos/${owner}/${repo}/readme`).catch(() => null),
    fetchRepoTree(owner, repo, repoData.default_branch),
    fetchManifest(owner, repo),
  ]);

  const readme = readmeData ? truncate(decodeBase64(readmeData.content), 2000) : '';
  const { extensions, configFiles, rootDirs } = analyzeTree(treePaths);
  const category = detectCategory(repoData.topics, repoData.language, extensions);

  const prompt = `Tu es un assistant qui génère des fiches de projets pour un portfolio de développeur.

Voici les informations d'un repo GitHub :
- Nom : ${repoData.name}
- Description : ${repoData.description || 'Aucune'}
- Langage principal : ${repoData.language || 'Non spécifié'}
- Topics GitHub : ${repoData.topics.join(', ') || 'Aucun'}
- Extensions de fichiers présentes (par fréquence) : ${extensions.join(', ') || 'Aucune'}
- Fichiers de config/manifeste détectés : ${configFiles.join(', ') || 'Aucun'}
- Dossiers racine : ${rootDirs.join(', ') || 'Aucun'}
- Nombre total de fichiers analysés : ${treePaths.length}

${manifest ? `Contenu du manifeste de dépendances :\n${manifest}\n` : ''}
${readme ? `README (extrait) :\n${readme}` : 'Pas de README disponible'}

Génère une fiche projet en JSON avec exactement ces champs :
{
  "title_fr": "Titre court en français (max 50 caractères)",
  "title_en": "Short title in English (max 50 chars)",
  "short_description_fr": "Description courte en français (1-2 phrases, max 120 caractères)",
  "short_description_en": "Short description in English (1-2 sentences, max 120 chars)",
  "description_fr": "Description longue en français (3-5 phrases, présente le projet, ses fonctionnalités et technologies clés)",
  "description_en": "Long description in English (3-5 sentences)",
  "technologies": "Tableau JSON stringifié des technologies, ex: \\"[\\"Vue 3\\",\\"Node.js\\",\\"SQLite\\"]\\". Déduis les techno réelles depuis les extensions, config files et dépendances — sois précis et exhaustif."
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

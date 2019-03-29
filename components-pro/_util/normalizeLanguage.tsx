export default function normalizeLanguage(language?: string): string | undefined {
  return language && language.replace('_', '-').toLowerCase();
}

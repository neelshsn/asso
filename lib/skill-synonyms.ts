export const skillSynonyms: Record<string, string[]> = {
  education: ["teaching", "mentoring", "tutoring"],
  health: ["medical", "clinic", "nursing"],
  communication: ["storytelling", "content", "public speaking"],
  logistics: ["supply", "operations", "coordination"],
  fundraising: ["development", "sponsorship", "grant writing"],
};

export function hasSynonymMatch(volSkill: string, oppSkill: string) {
  const normalized = volSkill.toLowerCase();
  const target = oppSkill.toLowerCase();
  return (
    normalized === target ||
    Object.entries(skillSynonyms).some(([key, values]) => {
      const set = [key.toLowerCase(), ...values.map((v) => v.toLowerCase())];
      return set.includes(normalized) && set.includes(target);
    })
  );
}

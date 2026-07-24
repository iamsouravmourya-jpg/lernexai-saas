export function getCertificateGrade(score: number) {
  if (score >= 91) return { grade: 'O', label: 'Outstanding' };
  if (score >= 86) return { grade: 'A+', label: 'Excellent' };
  if (score >= 80) return { grade: 'A', label: 'Very Good' };
  if (score >= 60) return { grade: 'B', label: 'Good' };
  if (score >= 40) return { grade: 'C', label: 'Average' };
  return { grade: 'D', label: 'Needs Work' };
}

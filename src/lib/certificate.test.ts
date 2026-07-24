import { describe, expect, it } from 'vitest';
import { getCertificateGrade } from './certificate';

describe('getCertificateGrade', () => {
  it('returns the correct grade for high scores', () => {
    expect(getCertificateGrade(95)).toEqual({ grade: 'O', label: 'Outstanding' });
  });

  it('returns a passing grade for average scores', () => {
    expect(getCertificateGrade(42)).toEqual({ grade: 'C', label: 'Average' });
  });

  it('returns a fallback grade for low scores', () => {
    expect(getCertificateGrade(20)).toEqual({ grade: 'D', label: 'Needs Work' });
  });
});

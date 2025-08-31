import { describe, it, expect } from 'vitest';
import { createPKCE } from '../../src/auth/pkce';

describe('PKCE', () => {
  it('generates verifier and challenge', async () => {
    const { verifier, challenge } = await createPKCE();
    expect(verifier).toBeTypeOf('string');
    expect(challenge).toBeTypeOf('string');
    expect(challenge.length).toBeGreaterThan(10);
  });
});
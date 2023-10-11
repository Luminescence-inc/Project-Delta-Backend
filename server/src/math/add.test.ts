import add from './add';

describe('This is a test', () => {
  it('should pass', () => {
    const result = add(2, 3);
    expect(result).toBe(5);
  });
});

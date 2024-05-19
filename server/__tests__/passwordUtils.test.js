const { checkPassword } = require("../utils/passwordUtils");

beforeEach(() => {
  // Mock console.error
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  // Restore the original console.error function
  console.error.mockRestore();
});
describe("checkPassword function", () => {
  it("should return true for valid passwords", async () => {
    const result1 = await checkPassword("ValidPassword1@");
    expect(result1).toBe(true);

    const result2 = await checkPassword("P@ssword123");
    expect(result2).toBe(true);
  });

  it("should return false for invalid passwords", async () => {
    const result1 = await checkPassword("weakpassword"); // No uppercase
    expect(result1).toBe(false);

    const result2 = await checkPassword("password123"); // No special characters
    expect(result2).toBe(false);

    const result3 = await checkPassword("short"); // Too short
    expect(result3).toBe(false);

    const result4 = await checkPassword("NoSpecialChars1"); // Missing special character
    expect(result4).toBe(false);

    const result5 = await checkPassword("NoNumbers@"); // Missing numbers
    expect(result5).toBe(false);

    const result6 = await checkPassword("1234567890"); // Only numbers
    expect(result6).toBe(false);

    const result7 = await checkPassword("ABCDEFGHIJ"); // Only uppercase
    expect(result7).toBe(false);

    const result8 = await checkPassword("abcdefghij"); // Only lowercase
    expect(result8).toBe(false);

    const result9 = await checkPassword("@@@@@@@@@@"); // Only special characters
    expect(result9).toBe(false);

    const result10 = await checkPassword(""); // Empty string
    expect(result10).toBe(false);

    const result11 = await checkPassword(" "); // Whitespace
    expect(result11).toBe(false);
  });
});


const { checkPassword } = require("./passwordUtils");

describe("checkPassword function", () => {
  // Test cases will go here
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
    });
  });
});

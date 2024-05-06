const validateEmail = require("../utils/emailUtils");

// Start describing your test suite
describe("validateEmail function", () => {
  // Individual test cases for valid emails
  it("should return true for valid emails", async () => {
    // Test various valid email formats
    const result1 = await validateEmail("simple@example.com");
    expect(result1).toBe(true);

    const result2 = await validateEmail("very.common@example.com");
    expect(result2).toBe(true);

    const result3 = await validateEmail(
      "disposable.style.email.with+symbol@example.com"
    );
    expect(result3).toBe(true);

    const result4 = await validateEmail("other.email-with-hyphen@example.com");
    expect(result4).toBe(true);
  });

  // Individual test cases for invalid emails
  it("should return false for invalid emails", async () => {
    // Test various invalid email formats
    const result1 = await validateEmail("not-an-email");
    expect(result1).toBe(false);

    const result2 = await validateEmail("@@example.com");
    expect(result2).toBe(false);

    const result3 = await validateEmail("missing-domain@.com");
    expect(result3).toBe(false);

    const result4 = await validateEmail("missing-username@example");
    expect(result4).toBe(false);
  });
});

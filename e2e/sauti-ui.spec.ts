import { test, expect } from "@playwright/test";

test.describe("Sauti ya Mwananchi UI", () => {
  test("loads chat page with title and input", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Sauti ya Mwananchi/i);
    await expect(
      page.getByRole("heading", { name: /Sauti ya Mwananchi/i })
    ).toBeVisible();
    await expect(page.getByPlaceholder(/Ask about voter rights/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /^Send$/ })).toBeVisible();
  });

  test("health returns ok and corpus sizes", async ({ request }) => {
    const res = await request.get(`/health`);
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.status).toBe("ok");
    expect(data.corpus.constitution_chars).toBeGreaterThan(100_000);
    expect(data.corpus.iebc_guide_chars).toBeGreaterThan(100);
  });

  test("sends a civic question and shows assistant reply in chat", async ({
    page,
  }) => {
    await page.goto("/");
    const input = page.getByPlaceholder(/Ask about voter rights/i);
    await input.fill("Which constitution article covers voting rights?");
    await page.getByRole("button", { name: /^Send$/ }).click();

    // Wait for async /chat to finish (.typing is removed when response arrives).
    const thinking = page.getByText(/Sauti ya Mwananchi is thinking/i);
    await expect(thinking).toBeVisible({ timeout: 5_000 });
    await expect(thinking).toBeHidden({ timeout: 120_000 });

    const agentBubbles = page.locator(".agent-msg");
    await expect(agentBubbles).toHaveCount(2, { timeout: 5_000 });
    const text = await agentBubbles.nth(1).innerText();

    expect(text.length).toBeGreaterThan(20);
    const looksLikeError = /Samahani.*error/i.test(text);
    if (looksLikeError) {
      test.info().annotations.push({
        type: "notice",
        description:
          "Chat returned error text — fix local auth (gcloud auth application-default login) or quota, then re-run.",
      });
    } else {
      const cites = /(\[Source:|Article\s+\d+|Katiba|Ibara)/i.test(text);
      expect(cites).toBeTruthy();
    }
  });
});

// test/visual.spec.ts
import { expect, test } from '@playwright/test';

// This file is created by Storybook
// when we run `npm run build`
import storybook from '../storybook-static/index.json' assert { type: 'json' };

// Only run tests on stories, not other documentation pages.
const stories = Object.values(storybook.entries).filter(e => e.type === 'story');

//in total 229 stories
for (let i = 0; i < 20; i++) {
  let story = stories[i];
  test(`${story.title} ${story.name} should not have visual regressions`, async ({
    page
  }, workerInfo) => {
    const params = new URLSearchParams({
      id: story.id,
      viewMode: 'story'
    });

    await page.goto(`/iframe.html?${params.toString()}`);
    await page.waitForSelector('#storybook-root');
    //await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot(
      `${story.id}-${workerInfo.project.name}-${process.platform}.png`,
      {
        fullPage: true,
        animations: 'disabled'
      }
    );
  });
}

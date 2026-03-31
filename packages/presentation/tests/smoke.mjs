import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const [, , url = 'http://localhost:5004/', jsonPath, screenshotPath] = process.argv;

const ensureDir = (filePath) => {
  if (filePath) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }
};

const fail = (message) => {
  throw new Error(message);
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
const requests = [];
const failedRequests = [];

page.on('request', (request) => {
  requests.push({
    method: request.method(),
    url: request.url(),
    resourceType: request.resourceType(),
  });
});

page.on('requestfailed', (request) => {
  failedRequests.push({
    url: request.url(),
    error: request.failure()?.errorText ?? 'unknown',
  });
});

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(700);

const summary = await page.evaluate(() => {
  const hero = document.querySelector('[data-testid="hero"]');
  const sectionIds = [...document.querySelectorAll('[data-section-id]')].map((node) => node.getAttribute('data-section-id'));
  const navLinks = [...document.querySelectorAll('[data-testid="section-nav"] a')].map((anchor) => anchor.getAttribute('href'));
  const experimentPanels = document.querySelectorAll('[data-experiment-card]').length;
  const images = [...document.images].map((image) => ({
    currentSrc: image.currentSrc,
    complete: image.complete,
    naturalWidth: image.naturalWidth,
  }));

  return {
    title: document.title,
    hasHero: Boolean(hero),
    sectionIds,
    navLinks,
    experimentPanels,
    imageCount: images.length,
    brokenImages: images.filter((image) => image.currentSrc && (!image.complete || image.naturalWidth === 0)),
  };
});

if (!summary.hasHero) {
  fail('Hero block not found');
}

if (summary.sectionIds.length !== 12) {
  fail(`Expected 12 sections, received ${summary.sectionIds.length}`);
}

if (summary.experimentPanels !== 6) {
  fail(`Expected 6 experiment panels, received ${summary.experimentPanels}`);
}

for (const href of summary.navLinks) {
  if (!href?.startsWith('#')) {
    fail(`Unexpected nav href: ${href}`);
  }

  const target = href.slice(1);

  if (!summary.sectionIds.includes(target)) {
    fail(`Anchor ${href} does not match any rendered section`);
  }
}

if (summary.brokenImages.length) {
  fail(`Broken images detected: ${JSON.stringify(summary.brokenImages)}`);
}

if (failedRequests.length) {
  fail(`Failed network requests detected: ${JSON.stringify(failedRequests, null, 2)}`);
}

if (jsonPath) {
  ensureDir(jsonPath);
  fs.writeFileSync(
    jsonPath,
    JSON.stringify(
      {
        url,
        requests,
        failedRequests,
        ...summary,
      },
      null,
      2,
    ),
  );
}

if (screenshotPath) {
  ensureDir(screenshotPath);
  await page.screenshot({ path: screenshotPath, fullPage: true });
}

console.log(
  JSON.stringify(
    {
      url,
      sections: summary.sectionIds.length,
      experimentPanels: summary.experimentPanels,
      imageCount: summary.imageCount,
      requests: requests.length,
    },
    null,
    2,
  ),
);

await browser.close();

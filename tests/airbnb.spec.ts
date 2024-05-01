import { Page, test } from "@playwright/test";
import { db } from "../db";
import { links } from "../db/schema";
import { eq } from "drizzle-orm";
import { telegramBot } from "../libs/telegram";
import dotenv from "dotenv";
import { airbnbConfig } from "../airbnb";
import {
  generateLinksFromPlaces,
  getStaysCountFromPage,
  updateStaysCountInDB,
} from "../utils/airbnb";
import { format } from "date-fns";

dotenv.config();

async function processLink(
  page: Page,
  link: string,
  onCountChange: () => void
) {
  await page.goto(link);

  const staysCount = await getStaysCountFromPage(page);

  if (!staysCount) return;

  const lastCount = await db.select().from(links).where(eq(links.link, link));

  if (!lastCount[0] || lastCount[0].staysCount !== staysCount) {
    onCountChange();
  }

  await updateStaysCountInDB(link, staysCount);
}

test.beforeAll(() => {
  telegramBot.launch();
});

test.afterAll(() => {
  telegramBot.stop();
});

test("AirBnb regular links check", async ({ page }) => {
  for (const link of airbnbConfig.links) {
    await processLink(page, link, async () => {
      await telegramBot.telegram.sendMessage(
        process.env.CHAT_ID!,
        `Nowe miejscówki z zapisanego linku! \n ${link}`
      );
    });
  }

  telegramBot.stop();
});

test("AirBnb generated links", async ({ page }) => {
  const generatedLinks = generateLinksFromPlaces();

  for (const place of generatedLinks) {
    const link = place.link;

    await processLink(page, link, async () => {
      await telegramBot.telegram.sendMessage(
        process.env.CHAT_ID!,
        `Nowe noclegi w ${place.name}! Od ${format(
          place.start,
          "dd-MM-yyyy"
        )} do ${format(place.end, "dd-MM-yyyy")} \n ${link}`
      );
    });
  }
});

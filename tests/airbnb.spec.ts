import { Page, expect, test } from "@playwright/test";
import { db } from "../db";
import { links, stays } from "../db/schema";
import { eq } from "drizzle-orm";
import { telegramBot } from "../libs/telegram";
import dotenv from "dotenv";
import { Place, airbnbConfig } from "../airbnb";
import { addDays, addMonths, eachWeekendOfInterval, format } from "date-fns";
import { Stay } from "../db/types";

dotenv.config();

type GeneratedPlace = Place & { link: string; start: Date; end: Date };

async function processDetailsFromLink(
  page: Page,
  link: string,
  generatedFromPlace?: GeneratedPlace
) {
  console.log("Checking link: ", link);

  await page.goto(link);
  page.waitForLoadState();

  // Make sure the page is loaded and some heading is visible
  const listingsLocator = page.locator("div[itemprop=itemListElement]");
  const firstListing = listingsLocator.first();
  const emptyListingsLocator = page.getByRole("heading", {
    name: "Brak dokładnych dopasowań",
  });
  const combinedLocator = page.getByText("Jedna podróż, dwa pobyty");

  await expect
    .soft(firstListing.or(emptyListingsLocator).or(combinedLocator).nth(0))
    .toBeVisible();

  const staysHeading = await page.getByTestId("stays-page-heading");

  const staysHeadingText = await staysHeading.allInnerTexts();

  if (!staysHeadingText.length) {
    console.log("Heading text not found");
  } else {
    console.log("Heading text: ", staysHeadingText);
  }

  const stayHeadingSplit = staysHeadingText[0]
    ? staysHeadingText[0].split(":")
    : null;

  const city = stayHeadingSplit ? stayHeadingSplit[1].trim() : null;

  const staysCountText =
    staysHeadingText && staysHeadingText[0]
      ? staysHeadingText[0].match(/^[^\d]*(\d+)/)
      : null;

  const staysCount =
    staysCountText && staysCountText[0] ? parseInt(staysCountText[0], 10) : 0;

  console.log("Stays count on page: ", staysCount);

  if (staysCount) {
    await db
      .insert(links)
      .values({
        link: link,
        staysCount,
      })
      .onConflictDoUpdate({
        target: links.link,
        set: { staysCount },
      });
  }

  // Get all listings from the page, save them in the database and send a message if there are any updates
  const allListingsLocator = await listingsLocator.all();

  for (const listing of allListingsLocator) {
    const url = await listing
      .locator("meta[itemprop=url]")
      .getAttribute("content");

    if (!url) continue;

    // Remove the param to avoid randomness in the URL
    const parsedURL = new URL(`https://${url}`);
    parsedURL.searchParams.delete("source_impression_id");

    const name = await listing
      .locator("meta[itemprop=name]")
      .getAttribute("content");

    // Use generated from place date as with selected dates in filters the date is not visible on the list
    const generatedPlaceDate = generatedFromPlace
      ? format(generatedFromPlace.start, "dd-MM-yyyy") +
        " - " +
        format(generatedFromPlace.end, "dd-MM-yyyy")
      : null;

    const date = !generatedFromPlace
      ? await listing
          .getByTestId("listing-card-subtitle")
          .last()
          .locator("span[aria-hidden=true]")
          .first()
          .textContent()
      : generatedPlaceDate;

    const price = await listing
      .getByTestId("price-availability-row")
      .locator(`div[aria-hidden=true]`)
      .textContent();

    const savedStays = await db
      .select()
      .from(stays)
      .where(eq(stays.link, parsedURL.href));

    const newStay: Stay = {
      parentLink: link,
      name: name ?? "No name",
      link: parsedURL.href,
      price: price ?? "No price",
      date: date ?? "No date",
      city: city ?? "No city",
    };

    const savedStay = savedStays[0];

    if (
      !savedStay ||
      savedStay.price !== newStay.price ||
      savedStay.date !== newStay.date
    ) {
      let updateReason = "";

      if (!savedStay) {
        updateReason = "New place";
      } else {
        updateReason =
          savedStay.price !== newStay.price
            ? `Different price (${savedStay.price} -> ${newStay.price})`
            : `New dates (${savedStay.date} -> ${newStay.date})`;
      }

      console.log("Updating user because of", { updateReason });

      await telegramBot.telegram.sendMessage(
        process.env.CHAT_ID!,
        `${updateReason} in ${newStay.city}!\n${newStay.name}\n${newStay.date}\n${newStay.price}\n${newStay.link}`
      );
    }

    await db.insert(stays).values(newStay).onConflictDoUpdate({
      target: stays.link,
      set: newStay,
    });
  }
}

test.beforeAll(() => {
  telegramBot.launch();
});

test.afterAll(() => {
  telegramBot.stop();
});

test("AirBnb regular links check", async ({ page }) => {
  for (const link of airbnbConfig.links) {
    await processDetailsFromLink(page, link);
  }
});

test("AirBnb generated links", async ({ page }) => {
  const upcomingWeekendsDates = eachWeekendOfInterval({
    start: new Date(),
    end: addMonths(new Date(), 3),
  }).reduce<Array<Array<Date>>>(
    (result, _value, index, sourceArray) =>
      index % 2 === 0
        ? [...result, sourceArray.slice(index, index + 2)]
        : result,
    []
  );

  const links: Array<GeneratedPlace> = [];

  for (let place of airbnbConfig.places) {
    upcomingWeekendsDates.forEach((weekend) => {
      const link = new URL(`https://www.airbnb.pl/s/${place.name}/homes`);

      link.searchParams.append("tab_id", "home_tab");
      link.searchParams.append("checkin", format(weekend[0], "yyyy-MM-dd"));
      link.searchParams.append(
        "checkout",
        format(addDays(weekend[0], 7), "yyyy-MM-dd")
      );
      link.searchParams.append("place_id", place.id);
      link.searchParams.append("adults", "2");
      link.searchParams.append("price_filter_input_type", "0");
      link.searchParams.append("price_max", place.priceMax.toString());
      link.searchParams.append("search_type", "filter_change");
      link.searchParams.append("room_types[]", "Entire home/apt");
      link.searchParams.append("min_bathrooms", "1");

      if (place.map) {
        link.searchParams.append("sw_lat", place.map.sw.lat);
        link.searchParams.append("sw_lng", place.map.sw.lng);
        link.searchParams.append("ne_lat", place.map.ne.lat);
        link.searchParams.append("ne_lng", place.map.ne.lng);
        link.searchParams.append("zoom", place.map.zoom);
      }

      links.push({
        ...place,
        link: link.href,
        start: weekend[0],
        end: addDays(weekend[0], 7),
      });
    });
  }

  for (const place of links) {
    await processDetailsFromLink(page, place.link, place);
  }
});

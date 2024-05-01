import { Page, expect } from "@playwright/test";
import { addDays, addMonths, eachWeekendOfInterval, format } from "date-fns";
import { Place, airbnbConfig } from "../airbnb";
import { db } from "../db";
import { links } from "../db/schema";

export async function getStaysCountFromPage(page: Page) {
  const staysHeading = await page.getByTestId("stays-page-heading");

  const isHeadingVisible = await staysHeading.isVisible();

  if (!isHeadingVisible) {
    console.log("Heading not visible");
    return;
  }

  const staysHeadingText = await staysHeading.allInnerTexts();

  if (!staysHeadingText) {
    console.log("Heading text not found");
    return;
  }

  console.log("Heading text: ", staysHeadingText);

  const staysCountText = staysHeadingText[0].match(/^[^\d]*(\d+)/);
  const staysCount =
    staysCountText && staysCountText[0] ? parseInt(staysCountText[0], 10) : 0;

  return staysCount;
}

export const generateLinksFromPlaces = () => {
  const nextWeekends = eachWeekendOfInterval({
    start: new Date(),
    end: addMonths(new Date(), 2),
  }).reduce<Array<Array<Date>>>(
    (result, _value, index, sourceArray) =>
      index % 2 === 0
        ? [...result, sourceArray.slice(index, index + 2)]
        : result,
    []
  );

  const links: Array<Place & { link: string; start: Date; end: Date }> = [];

  for (let place of airbnbConfig.places) {
    nextWeekends.forEach((weekend) => {
      if (place.type === "weekend-to-weekend" || place.type === "all") {
        links.push({
          ...place,
          link: buildAirbnbLink(place, weekend[0], addDays(weekend[0], 7)),
          start: weekend[0],
          end: addDays(weekend[0], 7),
        });
      }

      if (place.type === "weekend" || place.type === "all") {
        links.push({
          ...place,
          link: buildAirbnbLink(place, weekend[0], weekend[1]),
          start: weekend[0],
          end: weekend[1],
        });
      }
    });
  }

  return links;
};

export const updateStaysCountInDB = async (link: string, count: number) => {
  await db
    .insert(links)
    .values({
      link: link,
      staysCount: count,
    })
    .onConflictDoUpdate({
      target: links.link,
      set: { staysCount: count },
    });
};

export const buildAirbnbLink = (
  place: Place,
  startDate: Date,
  endDate: Date
) => {
  const link = new URL(`https://www.airbnb.pl/s/${place.name}/homes`);

  link.searchParams.append("tab_id", "home_tab");
  link.searchParams.append("checkin", format(startDate, "yyyy-MM-dd"));
  link.searchParams.append("checkout", format(endDate, "yyyy-MM-dd"));
  link.searchParams.append("place_id", place.id);
  link.searchParams.append("adults", "2");
  link.searchParams.append("price_filter_input_type", "0");
  link.searchParams.append("price_max", place.priceMax.toString());
  link.searchParams.append("search_type", "filter_change");
  link.searchParams.append("room_types[]", "Entire home/apt");

  if (place.map) {
    link.searchParams.append("sw_lat", place.map.sw.lat);
    link.searchParams.append("sw_lng", place.map.sw.lng);
    link.searchParams.append("ne_lat", place.map.ne.lat);
    link.searchParams.append("ne_lng", place.map.ne.lng);
    link.searchParams.append("zoom", place.map.zoom);
  }

  // link.searchParams.append(
  //   "monthly_start_date",
  //   format(startDate, "yyyy-MM-dd")
  // );
  // link.searchParams.append("monthly_length", "3");
  // link.searchParams.append("monthly_end_date", format(endDate, "yyyy-MM-dd"));

  return link.href;
};

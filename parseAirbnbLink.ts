import type { Place } from "./airbnb";

if (process.argv.length === 2) {
  console.error("Expected at least one argument!");
  process.exit(1);
}

const link = process.argv[2];

const url = new URL(link);

console.log({ url });

const nameMatch = url.pathname.match(/\/s\/(.+)\/homes/);

if (!nameMatch) {
  console.error("Invalid link! Name missing", { nameMatch });

  process.exit(1);
}

const price = url.searchParams.get("price_max");
const swLng = url.searchParams.get("sw_lng");
const swLat = url.searchParams.get("sw_lat");
const neLng = url.searchParams.get("ne_lng");
const neLat = url.searchParams.get("ne_lat");
const zoom = url.searchParams.get("zoom");

const place: Place = {
  name: nameMatch[1],
  type: "weekend-to-weekend",
  id: url.searchParams.get("place_id")!,
  priceMax: price ? parseInt(price) : 500,
  map: {
    ne: {
      lat: neLat!,
      lng: neLng!,
    },
    sw: {
      lat: swLat!,
      lng: swLng!,
    },
    zoom: zoom!,
  },
};

console.log(JSON.stringify(place, null, 2));

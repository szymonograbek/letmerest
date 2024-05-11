export interface Place {
  name: string;
  type: "weekend-to-weekend";
  id: string;
  priceMax: number;
  map?: {
    ne: {
      lat: string;
      lng: string;
    };
    sw: {
      lat: string;
      lng: string;
    };
    zoom: string;
  };
}

interface AirbnbConfig {
  links: Array<string>;
  places: Array<Place>;
}

export const airbnbConfig: AirbnbConfig = {
  links: [
    "https://www.airbnb.pl/s/Malaga--Spain/homes?place_id=ChIJUdEwjWn2cg0RgOZ2pXjSAwQ&checkin=2025-01-17&checkout=2025-02-21&date_picker_type=flexible_dates&adults=2&search_type=filter_change&tab_id=home_tab&query=Malaga,%20Spain&monthly_start_date=2024-06-01&monthly_length=3&monthly_end_date=2024-09-01&price_filter_input_type=1&price_filter_num_nights=28&channel=EXPLORE&flexible_trip_lengths%5B%5D=one_month&flexible_trip_dates%5B%5D=february&flexible_trip_dates%5B%5D=january&flexible_trip_dates%5B%5D=march&source=structured_search_input_header&price_max=5000&l2_property_type_ids%5B%5D=1&l2_property_type_ids%5B%5D=3&room_types%5B%5D=Entire%20home/apt&amenities%5B%5D=4&amenities%5B%5D=33&ne_lat=36.74444189008282&ne_lng=-4.393265834360818&sw_lat=36.69203972383156&sw_lng=-4.46374540009495&zoom=14.613124999999116&zoom_level=14&search_by_map=true",
  ],
  places: [
    {
      name: "Kopenhaga--Dania",
      type: "weekend-to-weekend",
      id: "ChIJIz2AXDxTUkYRuGeU5t1-3QQ",
      priceMax: 400,
      map: {
        ne: {
          lat: "55.71796498986249",
          lng: "12.616596897918015",
        },
        sw: {
          lat: "55.649436878812175",
          lng: "12.522918676694616",
        },
        zoom: "12.640693023195084",
      },
    },
    {
      name: "Amsterdam--Netherlands",
      type: "weekend-to-weekend",
      id: "ChIJVXealLU_xkcRja_At0z9AGY",
      priceMax: 400,
      map: {
        ne: {
          lat: "52.44258136858982",
          lng: "4.959820710071483",
        },
        sw: {
          lat: "52.29469442550155",
          lng: "4.774502649051158",
        },
        zoom: "11.656475117618948",
      },
    },
  ],
};

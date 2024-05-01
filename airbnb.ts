export interface Place {
  name: string;
  type: "all" | "weekend" | "weekend-to-weekend";
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
    "https://www.airbnb.pl/s/Berlin--Niemcy/homes?tab_id=home_tab&flexible_trip_lengths%5B%5D=one_week&monthly_start_date=2024-05-01&monthly_length=3&monthly_end_date=2024-08-01&price_filter_input_type=0&channel=EXPLORE&query=Berlin,%20Niemcy&place_id=ChIJAVkDPzdOqEcRcDteW0YgIQQ&date_picker_type=calendar&checkin=2024-05-31&checkout=2024-06-02&adults=2&source=structured_search_input_header&search_type=user_map_move&price_filter_num_nights=2&ne_lat=52.56992576752541&ne_lng=13.486230599476244&sw_lat=52.48300724473815&sw_lng=13.33220579191621&zoom=13.485239206970665&zoom_level=13.485239206970665&search_by_map=true&room_types%5B%5D=Entire%20home/apt&price_max=600",
    "https://www.airbnb.pl/s/Malaga--Spain/homes?place_id=ChIJUdEwjWn2cg0RgOZ2pXjSAwQ&checkin=2025-01-17&checkout=2025-02-21&date_picker_type=flexible_dates&adults=2&search_type=user_map_move&tab_id=home_tab&query=Malaga,%20Spain&monthly_start_date=2024-06-01&monthly_length=3&monthly_end_date=2024-09-01&price_filter_input_type=1&price_filter_num_nights=28&channel=EXPLORE&flexible_trip_lengths%5B%5D=one_month&flexible_trip_dates%5B%5D=february&flexible_trip_dates%5B%5D=january&source=structured_search_input_header&price_max=4000&l2_property_type_ids%5B%5D=1&l2_property_type_ids%5B%5D=3&room_types%5B%5D=Entire%20home/apt&amenities%5B%5D=4&amenities%5B%5D=47&ne_lat=36.74444189008282&ne_lng=-4.393265834360818&sw_lat=36.69203972383156&sw_lng=-4.46374540009495&zoom=14.613124999999116&zoom_level=14.613124999999116&search_by_map=true",
  ],
  places: [
    {
      name: "Kopenhaga--Dania",
      type: "weekend-to-weekend",
      id: "ChIJIz2AXDxTUkYRuGeU5t1-3QQ",
      priceMax: 270,
      map: {
        ne: {
          lat: "55.84450503073592",
          lng: "12.69643107622332",
        },
        sw: {
          lat: "55.54415678379443",
          lng: "12.288694354186646",
        },
        zoom: "10.518840714010674",
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

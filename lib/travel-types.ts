export type AccountUser = {
  displayName: string;
  email: string;
};

export type PlannerInput = {
  destination: string;
  date: string;
  days: string;
  people: string;
  budget: string;
  interests: string[];
  transport: string;
};

export type ItineraryItem = {
  time: string;
  place: string;
  activity: string;
  transport: string;
  meal: string;
  note: string;
};

export type ItineraryDay = {
  day: number;
  title: string;
  items: ItineraryItem[];
};

export type GeneratedItinerary = {
  title: string;
  summary: string;
  days: ItineraryDay[];
  reminders: string[];
  generatedAt: string;
  model: string;
};

export type WeatherDay = {
  date: string;
  code: number;
  label: string;
  temperatureMax: number;
  temperatureMin: number;
  precipitationProbability: number;
  windSpeedMax: number;
};

export type WeatherSummary = {
  location: string;
  timezone: string;
  days: WeatherDay[];
  sourceUrl: string;
  notice?: string;
};

export type TrafficSummary = {
  mode: string;
  durationMinutes: number | null;
  distanceKilometers: number | null;
  trafficStatus: string;
  instructions: string[];
  sourceUrl: string;
};

export type DestinationDetail = {
  title: string;
  description: string;
  extract: string;
  image: string | null;
  sourceUrl: string;
  lastUpdated: string | null;
};

export type SavedTripRecord = {
  id: string;
  title: string;
  destination: string;
  itinerary: GeneratedItinerary;
  createdAt: string;
  updatedAt: string;
};

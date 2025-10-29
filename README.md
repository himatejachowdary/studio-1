# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Setup

Before running the application, you need to configure your API keys in the `.env` file.

1.  **Gemini API Key**:
    -   Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
    -   Create a new API key.
    -   Copy the key and paste it into the `GEMINI_API_KEY` field in the `.env` file.

2.  **Google Maps API Key**:
    -   Go to the [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/overview).
    -   Enable the "Maps JavaScript API".
    -   Go to the "Credentials" page and create a new API key.
    -   Copy the key and paste it into the `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` field in the `.env` file.

import { Loader } from "@googlemaps/js-api-loader";

let googleMapsLoader: Loader | null = null;

export function getGoogleMapsLoader(): Loader {
    if (!googleMapsLoader) {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
            throw new Error(
                "Google Maps API Key não configurada. Adicione NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ao arquivo .env"
            );
        }

        googleMapsLoader = new Loader({
            apiKey,
            version: "weekly",
            libraries: ["places", "geocoding"],
        });
    }

    return googleMapsLoader;
}

export async function loadGoogleMaps(): Promise<typeof google> {
    const loader = getGoogleMapsLoader();
    return await loader.load();
}

export interface Coordinates {
    lat: number;
    lng: number;
}

export async function geocodeAddress(address: string): Promise<Coordinates | null> {
    try {
        const google = await loadGoogleMaps();
        const geocoder = new google.maps.Geocoder();

        const result = await geocoder.geocode({ address });

        if (result.results && result.results.length > 0) {
            const location = result.results[0].geometry.location;
            return {
                lat: location.lat(),
                lng: location.lng(),
            };
        }

        return null;
    } catch (error) {
        console.error("Erro ao geocodificar endereço:", error);
        return null;
    }
}

export async function reverseGeocode(coordinates: Coordinates): Promise<string | null> {
    try {
        const google = await loadGoogleMaps();
        const geocoder = new google.maps.Geocoder();

        const result = await geocoder.geocode({
            location: coordinates,
        });

        if (result.results && result.results.length > 0) {
            return result.results[0].formatted_address;
        }

        return null;
    } catch (error) {
        console.error("Erro ao fazer geocoding reverso:", error);
        return null;
    }
}

export function calculateDistance(
    point1: Coordinates,
    point2: Coordinates
): number {
    const R = 6371; // Raio da Terra em km
    const dLat = toRad(point2.lat - point1.lat);
    const dLng = toRad(point2.lng - point1.lng);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(point1.lat)) *
        Math.cos(toRad(point2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}

function toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
}

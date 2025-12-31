"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Locate, AlertCircle } from "lucide-react";
import { loadGoogleMaps, type Coordinates } from "@/lib/google-maps";

interface MapPickerProps {
    value?: Coordinates;
    onChange: (coordinates: Coordinates) => void;
    height?: string;
    zoom?: number;
    draggable?: boolean;
}

export function MapPicker({
    value,
    onChange,
    height = "400px",
    zoom = 15,
    draggable = true,
}: MapPickerProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapRef = useRef<google.maps.Map | null>(null);
    const markerRef = useRef<google.maps.Marker | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPosition, setCurrentPosition] = useState<Coordinates | null>(value || null);

    // Initialize map
    useEffect(() => {
        const initMap = async () => {
            if (!mapRef.current) return;

            try {
                setLoading(true);
                const google = await loadGoogleMaps();

                // Default position (São Paulo)
                const defaultPosition = value || { lat: -23.5505, lng: -46.6333 };

                const map = new google.maps.Map(mapRef.current, {
                    center: defaultPosition,
                    zoom: zoom,
                    mapTypeControl: true,
                    streetViewControl: false,
                    fullscreenControl: true,
                });

                googleMapRef.current = map;

                // Create marker
                const marker = new google.maps.Marker({
                    position: defaultPosition,
                    map: map,
                    draggable: draggable,
                    title: "Localização da filial",
                    animation: google.maps.Animation.DROP,
                });

                markerRef.current = marker;

                // Handle marker drag
                if (draggable) {
                    marker.addListener("dragend", () => {
                        const position = marker.getPosition();
                        if (position) {
                            const newCoords = {
                                lat: position.lat(),
                                lng: position.lng(),
                            };
                            setCurrentPosition(newCoords);
                            onChange(newCoords);
                        }
                    });
                }

                // Handle map click
                map.addListener("click", (e: google.maps.MapMouseEvent) => {
                    if (e.latLng) {
                        const newCoords = {
                            lat: e.latLng.lat(),
                            lng: e.latLng.lng(),
                        };
                        marker.setPosition(e.latLng);
                        setCurrentPosition(newCoords);
                        onChange(newCoords);
                    }
                });

                setLoading(false);
            } catch (err) {
                console.error("Erro ao carregar mapa:", err);
                setError(err instanceof Error ? err.message : "Erro ao carregar o mapa");
                setLoading(false);
            }
        };

        initMap();
    }, []); // Only run once on mount

    // Update marker when value changes externally
    useEffect(() => {
        if (value && markerRef.current && googleMapRef.current) {
            const position = new google.maps.LatLng(value.lat, value.lng);
            markerRef.current.setPosition(position);
            googleMapRef.current.setCenter(position);
            setCurrentPosition(value);
        }
    }, [value]);

    const centerOnCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };

                    if (googleMapRef.current && markerRef.current) {
                        const latLng = new google.maps.LatLng(coords.lat, coords.lng);
                        googleMapRef.current.setCenter(latLng);
                        markerRef.current.setPosition(latLng);
                        setCurrentPosition(coords);
                        onChange(coords);
                    }
                },
                (error) => {
                    console.error("Erro ao obter localização:", error);
                    setError("Não foi possível obter sua localização");
                }
            );
        } else {
            setError("Geolocalização não suportada pelo navegador");
        }
    };

    if (error) {
        return (
            <div
                className="flex flex-col items-center justify-center border border-red-500/20 bg-red-500/10 rounded-lg"
                style={{ height }}
            >
                <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
                <p className="text-red-400 text-sm">{error}</p>
                <p className="text-xs text-white/50 mt-2">
                    Verifique se a API Key do Google Maps está configurada
                </p>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Map container */}
            <div
                ref={mapRef}
                className="w-full rounded-lg border border-white/10 overflow-hidden"
                style={{ height }}
            >
                {loading && (
                    <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="mt-3 flex items-center justify-between">
                <button
                    type="button"
                    onClick={centerOnCurrentLocation}
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 transition-colors"
                >
                    <Locate className="w-4 h-4" />
                    Usar Minha Localização
                </button>

                {currentPosition && (
                    <div className="flex items-center gap-2 text-xs text-white/60">
                        <MapPin className="w-3 h-3" />
                        <span>
                            {currentPosition.lat.toFixed(6)}, {currentPosition.lng.toFixed(6)}
                        </span>
                    </div>
                )}
            </div>

            {/* Helper text */}
            <p className="text-xs text-white/50 mt-2">
                {draggable
                    ? "Clique no mapa ou arraste o marcador para definir a localização"
                    : "Clique no mapa para definir a localização"}
            </p>
        </div>
    );
}

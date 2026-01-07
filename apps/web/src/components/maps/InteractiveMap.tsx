/// <reference types="google.maps" />
"use client";

import { GlassCard, cn } from "@morina/ui";
import { MapPin, X, ZoomIn, ZoomOut, Navigation2 } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";

type InteractiveMapProps = {
  address: {
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    pais?: string;
  };
  onClose?: () => void;
  height?: string;
  className?: string;
};

export function InteractiveMap({
  address,
  onClose,
  height = "500px",
  className,
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);

  // Construir endereço completo
  const fullAddress = [
    address.logradouro,
    address.numero && `nº ${address.numero}`,
    address.complemento,
    address.bairro,
    address.cidade,
    address.estado,
    address.cep && `CEP: ${address.cep}`,
    address.pais,
  ]
    .filter(Boolean)
    .join(", ");

  useEffect(() => {
    // Verificar se Google Maps já está carregado
    if (typeof window === "undefined" || !window.google) {
      // Carregar Google Maps API
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setLoading(false);
        initializeMap();
      };
      script.onerror = () => {
        setError("Erro ao carregar Google Maps. Verifique a chave da API.");
        setLoading(false);
      };
      document.head.appendChild(script);
    } else {
      initializeMap();
    }

    return () => {
      if (marker && marker.setMap) {
        marker.setMap(null);
      }
    };
  }, [marker]);

  // Moved useEffect to after geocodeAddress definition


  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const defaultCenter = { lat: -23.5505, lng: -46.6333 }; // São Paulo

    const newMap = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 15,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
      styles: [
        {
          featureType: "all",
          elementType: "geometry",
          stylers: [{ color: "#1a1a2e" }],
        },
        {
          featureType: "all",
          elementType: "labels.text.fill",
          stylers: [{ color: "#ffffff" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#0f3460" }],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#16213e" }],
        },
      ],
    } as any);

    setMap(newMap);
    setGeocoder(new window.google.maps.Geocoder());
    setLoading(false);
  };

  const geocodeAddress = useCallback(() => {
    if (!geocoder || !map || !fullAddress) return;

    geocoder.geocode({ address: fullAddress }, (results: any, status: any) => {
      if (status === "OK" && results && results[0]) {
        const location = results[0].geometry.location;
        map.setCenter(location);
        map.setZoom(17);

        // Remover marcador anterior
        if (marker) {
          marker.setMap(null);
        }

        // Criar novo marcador
        const newMarker = new window.google.maps.Marker({
          position: location,
          map,
          title: fullAddress,
          animation: window.google.maps.Animation.DROP,
        });

        // Info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="color: #000; padding: 8px;">
              <strong>${fullAddress}</strong>
            </div>
          `,
        });

        newMarker.addListener("click", () => {
          infoWindow.open(map, newMarker);
        });

        setMarker(newMarker);
        setError(null);
      } else {
        setError("Endereço não encontrado. Verifique os dados do endereço.");
      }
    });
  }, [geocoder, map, fullAddress, marker]);

  useEffect(() => {
    if (map && geocoder && fullAddress && !loading) {
      geocodeAddress();
    }
  }, [map, geocoder, fullAddress, loading, geocodeAddress]);

  const handleZoomIn = () => {
    if (map) {
      const currentZoom = map.getZoom() || 15;
      map.setZoom(currentZoom + 1);
    }
  };

  const handleZoomOut = () => {
    if (map) {
      const currentZoom = map.getZoom() || 15;
      map.setZoom(currentZoom - 1);
    }
  };

  const handleCenter = () => {
    if (map && marker && marker.getPosition) {
      const position = marker.getPosition();
      if (position) {
        map.panTo(position);
      }
    }
  };

  if (!fullAddress || (!address.cidade && !address.logradouro)) {
    return (
      <GlassCard className={cn("p-6", className)}>
        <div className="flex items-center gap-2 text-white/50">
          <MapPin className="h-5 w-5" />
          <p className="text-sm">Preencha o endereço para visualizar no mapa</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className={cn("relative overflow-hidden", className)}>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center border border-white/10 bg-black/60 text-white/60 backdrop-blur-sm hover:bg-white/10 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <div className="border-b border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[hsl(var(--primary))]" />
            <h3 className="text-sm font-semibold text-white">Localização no Mapa</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleZoomOut}
              className="flex h-8 w-8 items-center justify-center border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
              title="Diminuir zoom"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              className="flex h-8 w-8 items-center justify-center border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
              title="Aumentar zoom"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleCenter}
              className="flex h-8 w-8 items-center justify-center border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
              title="Centralizar no marcador"
            >
              <Navigation2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        <p className="mt-2 text-xs text-white/50 truncate">{fullAddress}</p>
      </div>

      <div className="relative" style={{ height }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10">
            <div className="text-center">
              <div className="mb-2 h-8 w-8 animate-spin rounded-full border-2 border-[hsl(var(--primary))] border-t-transparent mx-auto" />
              <p className="text-sm text-white/70">Carregando mapa...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10">
            <div className="text-center p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          </div>
        )}

        <div ref={mapRef} className="h-full w-full" />
      </div>
    </GlassCard>
  );
}

// Declaração de tipos para Google Maps
// Removed conflicting global declaration
// declare global { ... }




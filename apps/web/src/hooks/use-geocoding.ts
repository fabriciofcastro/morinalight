import { useState, useCallback } from "react";
import { geocodeAddress, type Coordinates } from "@/lib/google-maps";

export function useGeocoding() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const geocode = useCallback(async (address: string): Promise<Coordinates | null> => {
        if (!address.trim()) {
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const coordinates = await geocodeAddress(address);

            if (!coordinates) {
                setError("Endereço não encontrado");
                return null;
            }

            return coordinates;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Erro ao buscar coordenadas";
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        geocode,
        loading,
        error,
    };
}

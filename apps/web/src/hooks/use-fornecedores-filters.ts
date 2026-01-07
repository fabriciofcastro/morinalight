"use client";

import { useReducer, useEffect, useState } from "react";

export type FiltersState = {
    search: string;
    debouncedSearch: string;
    status: string;
    viewMode: "grid" | "list";
    showAdvanced: boolean;
    advanced: {
        dataInicio: string;
        dataFim: string;
        documento: string;
        cidade: string;
        estado: string;
        email: string;
        telefone: string;
    };
    sorting: {
        field: "name" | "createdAt" | "updatedAt" | "status";
        order: "asc" | "desc";
    };
};

type FiltersAction =
    | { type: "SET_SEARCH"; payload: string }
    | { type: "SET_DEBOUNCED_SEARCH"; payload: string }
    | { type: "SET_STATUS"; payload: string }
    | { type: "SET_VIEW_MODE"; payload: "grid" | "list" }
    | { type: "TOGGLE_ADVANCED" }
    | { type: "SET_ADVANCED_FIELD"; field: keyof FiltersState["advanced"]; value: string }
    | { type: "SET_SORTING"; field: FiltersState["sorting"]["field"]; order: FiltersState["sorting"]["order"] }
    | { type: "RESET" };

const initialState: FiltersState = {
    search: "",
    debouncedSearch: "",
    status: "all",
    viewMode: "grid",
    showAdvanced: false,
    advanced: {
        dataInicio: "",
        dataFim: "",
        documento: "",
        cidade: "",
        estado: "",
        email: "",
        telefone: "",
    },
    sorting: {
        field: "createdAt",
        order: "desc",
    },
};

function filtersReducer(state: FiltersState, action: FiltersAction): FiltersState {
    switch (action.type) {
        case "SET_SEARCH":
            return { ...state, search: action.payload };
        case "SET_DEBOUNCED_SEARCH":
            return { ...state, debouncedSearch: action.payload };
        case "SET_STATUS":
            return { ...state, status: action.payload };
        case "SET_VIEW_MODE":
            return { ...state, viewMode: action.payload };
        case "TOGGLE_ADVANCED":
            return { ...state, showAdvanced: !state.showAdvanced };
        case "SET_ADVANCED_FIELD":
            return {
                ...state,
                advanced: { ...state.advanced, [action.field]: action.value },
            };
        case "SET_SORTING":
            return {
                ...state,
                sorting: { field: action.field, order: action.order },
            };
        case "RESET":
            return initialState;
        default:
            return state;
    }
}

/**
 * Custom hook for managing fornecedores filters state
 * Consolidates 17 useState into a single useReducer
 */
export function useFornecedoresFilters() {
    const [state, dispatch] = useReducer(filtersReducer, initialState);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch({ type: "SET_DEBOUNCED_SEARCH", payload: state.search });
        }, 500);

        return () => clearTimeout(timer);
    }, [state.search]);

    return {
        filters: state,
        setSearch: (value: string) => dispatch({ type: "SET_SEARCH", payload: value }),
        setStatus: (value: string) => dispatch({ type: "SET_STATUS", payload: value }),
        setViewMode: (value: "grid" | "list") => dispatch({ type: "SET_VIEW_MODE", payload: value }),
        toggleAdvanced: () => dispatch({ type: "TOGGLE_ADVANCED" }),
        setAdvancedField: (field: keyof FiltersState["advanced"], value: string) =>
            dispatch({ type: "SET_ADVANCED_FIELD", field, value }),
        setSorting: (field: FiltersState["sorting"]["field"], order: FiltersState["sorting"]["order"]) =>
            dispatch({ type: "SET_SORTING", field, order }),
        resetFilters: () => dispatch({ type: "RESET" }),
    };
}

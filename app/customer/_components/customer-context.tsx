"use client";
import { createContext, ReactNode, useContext, useState } from "react";
import { Service } from "@/lib/types";

interface CustomerContextType {
    selectedServices: Service[];
    toggleService: (service: Service) => void;
    removeService: (service: Service) => void;
    replaceCart: (service: Service) => void;
    resetCart: () => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export function CustomerContextProvider({ children }: { children: ReactNode }) {
    const [selectedServices, setSelectedServices] = useState<Service[]>([]);

    const toggleService = (service: Service) => {
        setSelectedServices((selectedServices) => {
            if (selectedServices.length > 0 && selectedServices[0].businessId !== service.businessId) return [service];

            return selectedServices.find((s) => s.id === service.id) ? selectedServices.filter((s) => s.id !== service.id) : [...selectedServices, service];
        });
    };

    const removeService = (service: Service) => {
        setSelectedServices(selectedServices.filter((s) => s.id !== service.id));
    };

    const resetCart = () => {
        setSelectedServices([]);
    };

    const replaceCart = (service: Service) => {
        setSelectedServices([service]);
    };

    return <CustomerContext.Provider value={{ selectedServices, removeService, toggleService, replaceCart, resetCart }}>{children}</CustomerContext.Provider>;
}

export function useCustomer() {
    const context = useContext(CustomerContext);

    if (context === undefined) throw new Error("useAuth must be use within AuthProvider");

    return context;
}

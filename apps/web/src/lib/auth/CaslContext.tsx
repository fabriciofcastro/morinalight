'use client';

import React, { createContext } from 'react';
import { createContextualCan } from '@casl/react';
import { ClientAppAbility } from './ability'; // Use ClientAppAbility
import { AppAbility } from '@morina/shared-kernel'; // Keep for default value instanciation if needed, or cast

export const AbilityContext = createContext<ClientAppAbility>(new AppAbility() as unknown as ClientAppAbility);
export const Can = createContextualCan(AbilityContext.Consumer);

export const useAbility = () => React.useContext(AbilityContext);

interface AbilityProviderProps {
    ability: ClientAppAbility;
    children: React.ReactNode;
}

export const AbilityProvider: React.FC<AbilityProviderProps> = ({ ability, children }) => {
    return (
        <AbilityContext.Provider value={ability}>
            {children}
        </AbilityContext.Provider>
    );
};



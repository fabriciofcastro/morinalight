'use client';

import React, { createContext } from 'react';
import { createContextualCan } from '@casl/react';
import { AppAbility } from '@morina/shared-kernel';

export const AbilityContext = createContext<AppAbility>(new AppAbility());
export const Can = createContextualCan(AbilityContext.Consumer);

export const useAbility = () => React.useContext(AbilityContext);

interface AbilityProviderProps {
    ability: AppAbility;
    children: React.ReactNode;
}

export const AbilityProvider: React.FC<AbilityProviderProps> = ({ ability, children }) => {
    return (
        <AbilityContext.Provider value={ability}>
            {children}
        </AbilityContext.Provider>
    );
};



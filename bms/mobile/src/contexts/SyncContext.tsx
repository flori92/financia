import React, { createContext, useState } from 'react';

export const SyncContext = createContext({});

export const SyncProvider = ({ children }: any) => {
  const [syncing, setSyncing] = useState(false);
  
  return (
    <SyncContext.Provider value={{ syncing, setSyncing }}>
      {children}
    </SyncContext.Provider>
  );
};

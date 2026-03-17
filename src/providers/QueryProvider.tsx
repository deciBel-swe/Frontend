'use client';

import React, { useRef, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
    const clientRef = useRef(new QueryClient());

    return <QueryClientProvider client={clientRef.current}>{children}</QueryClientProvider>;
}

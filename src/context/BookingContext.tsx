'use client';

import { createContext, useContext } from 'react';

export const BookingContext = createContext<() => void>(() => {});

export const useBooking = () => useContext(BookingContext);

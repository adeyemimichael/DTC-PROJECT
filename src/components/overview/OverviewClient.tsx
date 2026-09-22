'use client';

import { useState, useEffect } from 'react';
import { useVitals } from '@/src/hooks/useVitals';
import { InitialVitalsModal } from '@/src/components/common/InitialVitalsModal';

export function OverviewClient() {
  const { hasVitals, isLoading, createVital } = useVitals();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasDismissedModal, setHasDismissedModal] = useState(false);

  useEffect(() => {
    // Automatically trigger modal if user has finished loading, has no vitals recorded, and hasn't dismissed it in this session
    if (!isLoading && !hasVitals && !hasDismissedModal) {
      setIsModalOpen(true);
    }
  }, [isLoading, hasVitals, hasDismissedModal]);

  const handleClose = () => {
    setIsModalOpen(false);
    setHasDismissedModal(true);
  };

  return (
    <InitialVitalsModal
      isOpen={isModalOpen}
      onClose={handleClose}
      onSubmitVitals={createVital}
    />
  );
}

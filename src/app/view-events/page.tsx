'use client';

import BackButton from '@/components/BackButton';
import Container from '@/components/Container';
import EventList from '@/components/EventList';
import ProtectedRoute from '@/components/ProtectedRoute';

const ViewEvents = () => {
  return (
    <ProtectedRoute>
      <Container>
        <BackButton />
        <EventList />
      </Container>
    </ProtectedRoute>
  );
};

export default ViewEvents;

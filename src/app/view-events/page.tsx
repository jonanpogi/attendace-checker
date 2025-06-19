'use client';

import BackButton from '@/components/BackButton';
import Container from '@/components/Container';
import EventList from '@/components/EventList';

const ViewEvents = () => {
  return (
    <Container>
      <BackButton />
      <EventList />
    </Container>
  );
};

export default ViewEvents;

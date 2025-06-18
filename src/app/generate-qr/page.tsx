'use client';

import BackButton from '@/components/BackButton';
import Container from '@/components/Container';
import QRGeneratorForm from '@/components/QRGeneratorForm';

const GenerateQR = () => {
  return (
    <Container>
      <BackButton />
      <QRGeneratorForm />
    </Container>
  );
};

export default GenerateQR;

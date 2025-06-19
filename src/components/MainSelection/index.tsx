import { IconName } from '../Icons';
import SelectionItem from './SelectionItem';

const selections = [
  {
    title: 'Generate QR Code',
    description: 'Generate a new QR code for each personnel.',
    icon: 'QrCode' as IconName,
    link: '/generate-qr',
  },
  {
    title: 'Scan QR Code',
    description: 'Scan a QR code to check in attendance for a personnel.',
    icon: 'ScanQrCode' as IconName,
    link: '/scann-qr',
  },
  {
    title: 'View & Extract Event Reports',
    description: 'View and extract attendance events for all personnel.',
    icon: 'File' as IconName,
    link: '/view-events',
  },
];

const MainSelection = () => {
  return (
    <div className="flex h-auto w-full flex-col items-center justify-center gap-5 sm:flex-row">
      {selections.map((selection, index) => (
        <SelectionItem {...selection} key={index} />
      ))}
    </div>
  );
};

export default MainSelection;

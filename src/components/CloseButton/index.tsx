type Props = {
  onClose: () => void;
};

const CloseButton = ({ onClose }: Props) => {
  return (
    <button
      type="button"
      className="btn btn-sm btn-circle btn-ghost absolute top-4 right-4"
      onClick={() => onClose()}
    >
      ✕
    </button>
  );
};

export default CloseButton;

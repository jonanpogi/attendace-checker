type Props = {
  onClose: () => void;
};

const CloseButton = ({ onClose }: Props) => {
  return (
    <button
      type="button"
      className="btn btn-sm btn-circle btn-ghost absolute top-2 right-2"
      onClick={() => onClose()}
    >
      ✕
    </button>
  );
};

export default CloseButton;

type Props = {
  step: number;
  steps: {
    label: string;
    value: number;
  }[];
};

// TODO: Improve reusabilty and responsiveness
const Stepper = ({ step, steps }: Props) => {
  return (
    <div className="mx-auto max-w-xl px-6 pt-6">
      <div className="mb-4 flex items-center justify-center gap-3 text-sm">
        {steps.map((item, idx) => (
          <div key={item.value} className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center rounded-full ${step === item.value ? 'h-8 w-8 bg-indigo-600 text-white' : 'h-6 w-6 bg-gray-700 text-gray-200'}`}
            >
              {item.value}
            </div>
            <span
              className={`${step === item.value ? 'text-white' : 'text-gray-400'} hidden sm:block`}
            >
              {item.label}
            </span>
            {idx < steps.length - 1 && (
              <div className="h-px w-10 bg-gray-700" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stepper;

import { controlClass } from './styles';
import { Icon } from './Icon';

export interface Option<T extends string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string> {
  id: string;
  label: string;
  value: T;
  options: readonly Option<T>[];
  onChange: (value: T) => void;
}

/** Native <select> (best keyboard + screen reader support) with a visible, associated label. */
export function Select<T extends string>({ id, label, value, options, onChange }: SelectProps<T>) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foam-2">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value as T)}
          className={`${controlClass} cursor-pointer appearance-none pr-10`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-panel text-foam">
              {option.label}
            </option>
          ))}
        </select>
        <Icon name="chevron" className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foam-3" />
      </div>
    </div>
  );
}

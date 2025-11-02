import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
  onValueChange?: (value: string) => void;
}

interface SelectTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  placeholder?: string;
}

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface SelectItemProps extends React.OptionHTMLAttributes<HTMLOptionElement> {
  children: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, onValueChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onValueChange) {
        onValueChange(e.target.value);
      }
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <select
        className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
        ref={ref}
        {...props}
        onChange={handleChange}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';

export const SelectTrigger = React.forwardRef<HTMLDivElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  )
);
SelectTrigger.displayName = 'SelectTrigger';

export const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ className, placeholder, ...props }, ref) => (
    <span
      ref={ref}
      className={`block truncate ${className || ''}`}
      {...props}
    >
      {props.children || <span className="text-gray-500">{placeholder}</span>}
    </span>
  )
);
SelectValue.displayName = 'SelectValue';

export const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={`relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white text-gray-950 shadow-md ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  )
);
SelectContent.displayName = 'SelectContent';

export const SelectItem = React.forwardRef<HTMLOptionElement, SelectItemProps>(
  ({ className, children, ...props }, ref) => (
    <option
      ref={ref}
      className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 focus:text-gray-900 ${className || ''}`}
      {...props}
    >
      {children}
    </option>
  )
);
SelectItem.displayName = 'SelectItem';

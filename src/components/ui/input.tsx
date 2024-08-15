import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
  text?: string;
  textTop?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, error, text, textTop, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 pt-2">
        {textTop && <small className="text-gray-500">{textTop}</small>}
        <label className="input input-bordered flex items-center gap-2">
          {icon && icon}
          <input
            type={type}
            className={`grow ${className}`}
            ref={ref}
            {...props}
          />
        </label>
        {text && <small className="text-gray-500">{text}</small>}
        {error && <small className="text-red-500">{error}</small>}
      </div>
    );
  }
);

Input.displayName = "Input";

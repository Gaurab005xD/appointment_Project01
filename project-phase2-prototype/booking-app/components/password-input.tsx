"use client";

import { forwardRef, useState } from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

/** Password field with an accessible Show / Hide toggle. */
const PasswordInput = forwardRef<HTMLInputElement, Props>(function PasswordInput(props, ref) {
    const [visible, setVisible] = useState(false);
    return (
        <div className="relative">
            <input ref={ref} {...props} type={visible ? "text" : "password"} className="form-input pr-20" />
            <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-pressed={visible}
                aria-label={visible ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-2 my-1.5 rounded-md px-3 text-sm font-semibold text-brand-700 hover:bg-brand-50"
            >
                {visible ? "Hide" : "Show"}
            </button>
        </div>
    );
});

export default PasswordInput;

import React from "react";

export default function StarRating({ value = 0, onChange, readonly = false }) {
  const cls = ["stars"];
  if (readonly) cls.push("readonly");
  return (
    <span className={cls.join(" ")}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={"star " + (n <= value ? "on" : "")}
          onClick={readonly ? undefined : () => onChange?.(n === value ? 0 : n)}
        >
          ★
        </span>
      ))}
    </span>
  );
}

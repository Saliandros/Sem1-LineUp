import React from "react";

export default function Switch({ isOn, handleToggle }) {
  return (
    <section className="flex gap-4">
      <input
        name="isPaid"
        checked={isOn}
        onChange={handleToggle}
        className="hidden react-switch-checkbox "
        id={`react-switch-new`}
        type="checkbox"
      />
      <label
        className={`react-switch-label ${isOn ? `checkbox-on` : ``}`}
        htmlFor={`react-switch-new`}
      >
        <span className={`react-switch-button`} />
      </label>
      <span>Paid opportunity</span>
    </section>
  );
}

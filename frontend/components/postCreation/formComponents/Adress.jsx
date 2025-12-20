import { useState } from "react";

export default function AddressComponent({ address, setAddress }) {
  const [isEditingAddress, setIsEditingAddress] = useState(true);
  const [error, setError] = useState("");

  // const validateAddress = (value) => {
  //   if (!value.trim()) return "Address is required";
  //   if (!/\d/.test(value)) return "Address must include a house number";
  //   if (value.length < 6) return "Address is too short";
  //   return "";
  // };

  const handleDone = () => {
    // const validationError = validateAddress(address);
    // if (validationError) {
    //   setError(validationError);
    //   return;
    // }
    // setError("");
    setIsEditingAddress(false);
  };

  return (
    <div className="relative">
      <div
        className={`flex relative items-center gap-2 transition-colors duration-200 ${
          isEditingAddress ? "bg-input-background" : "bg-input-background/0"
        }`}
      >
        {isEditingAddress ? (
          <input
            className={`w-full p-3 ${error ? "border border-red-500" : ""}`}
            type="text"
            value={address}
            name="address"
            placeholder="Insert address"
            onChange={(e) => {
              setAddress(e.target.value);
              setError("");
            }}
          />
        ) : (
          <>
            <h3 className="w-full p-3 text-black">{address}</h3>
            <input type="hidden" name="address" value={address} />
          </>
        )}

        <button
          type="button"
          onClick={
            isEditingAddress ? handleDone : () => setIsEditingAddress(true)
          }
          className="absolute right-3 text-neutral-grey"
        >
          {isEditingAddress ? "Done" : "Edit"}
        </button>
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

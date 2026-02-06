import { useState } from "react";

function Warning({ title, text }) {
  const [show, setShow] = useState(false);

  return (
    <div className="flex-1 basis-[220px] text-center mb-4 mt-6">
      <button
        type="button"
        aria-expanded={show}
        aria-controls={`warning-${title}`}
        onClick={() => setShow(!show)}
        className="text-black bg-blue-400 hover:text-white hover:bg-blue-600
        focus:ring-2 focus:ring-blue-300 shadow font-medium rounded-full
        text-sm px-4 py-2.5 focus:outline-none transition"
      >
        {title} {show ? "" : ""}
      </button>

      <div
        id={`warning-${title}`}
        className={`mt-6 overflow-hidden transition-all duration-700 ease-in-out ${
          show ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p className="text-gray-700">{text}</p>
      </div>
    </div>
  );
}

export default Warning;

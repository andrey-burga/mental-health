import { useState } from "react";

function Warning({ title, text }) {
  const [show, setShow] = useState(false);

  return (
    <div className="flex-1 basis-[220px] text-center mb-2 mt-6">
      <button
        type="button"
        className="text-black bg-blue-400 hover:text-white hover:bg-blue-600 focus:ring-red-400 box-border border border-transparent shadow-xs font-medium leading-5 rounded-full text-sm px-4 py-2.5 focus:outline-none"
        onClick={() => setShow(!show)}
      >
        {title}
      </button>

      <div
        className={`mt-8 overflow-hidden transition-all duration-1000 ease-in-out ${
          show ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p>{text}</p>
      </div>
    </div>
  );
}

export default Warning;

import { useState } from "react";

// Recibimos 'title' (string) y 'text' (texto completo)
function Warning({ title, text }) {
  const [show, setShow] = useState(false);

  return (
    <div className="flex-1 basis-[220px] text-center">
      <button onClick={() => setShow(!show)}>
        {show ? "" : ""} {title}
      </button>

      {show && <p>{text}</p>}
    </div>
  );
}

export default Warning;

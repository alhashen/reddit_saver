import { useContext } from "react";
import Context from "../store/context";

export default function ShowSampleButton() {
  const { sampleVisible, setSampleVisible } = useContext(Context); 
  const showClickHandler = (e) => {
    e.preventDefault();
    setSampleVisible(!sampleVisible);
  };

  if (!sampleVisible) {
    return (
      <button onClick={showClickHandler} className="relative right-0 m-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="relative right-0 w-6 h-6 m-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="square"
            strokeLinejoin="square"
            strokeWidth="3"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    );
  } else {
    return (
      <button onClick={showClickHandler} className="relative right-0 m-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 m-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
            d="M5 15l7-7 7 7"
          />
        </svg>
      </button>
    );
  }
}

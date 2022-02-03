import {useContext, useState} from "react";
import Context from "../store/context";
import { instance } from "../utils/Utils";

const FetchButton = () => {
  const [ isLoading, setIsLoading ] = useState(false) 
  const { setFetchedItems, setSavedItems } = useContext(Context)

  async function fetchHandler() {
    setIsLoading(true);
    const res_fetch = await instance.get("/fetch");
    const status_fetch = await res_fetch.status;
    if (status_fetch === 200) {
      const res = await instance.get("/home");
      const data = await res.data;
      setFetchedItems(data);
      setSavedItems(data);
      setIsLoading(false);
    }
  }

  return (
    <div>
      <button disabled={isLoading} onClick={fetchHandler} >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={ isLoading ? ("w-6 h-6 animate-spin") : ("w-6 h-6") }
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    </div>
  );
};

export default FetchButton;

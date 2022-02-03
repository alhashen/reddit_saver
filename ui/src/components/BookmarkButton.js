import { useState, useEffect } from "react";
export default function BookmarkButton(props) {
  const { saved, name } = props;
  const [isBookmarked, setBookmark] = useState(saved);

  const axios = require("axios");
  const params = new URLSearchParams();
  params.append('name', name);
  const instance = axios.create({
    method: 'post',
    withCredentials: true,
    baseURL: "http://localhost:5000",
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    params: params 
  });
  
  const saveHandler = (e) => {
    e.preventDefault();
    setBookmark(true);
  };

  const unsaveHandler = async (e) => {
    e.preventDefault();
    const res = await instance.post("/unsave");
    if (res.status === 200) {
      setBookmark(false);
    }
  };

  return (
    <div className="h-8 m-0 text-right z-1">
      <button className="relative top-0" onClick={ isBookmarked ? unsaveHandler : saveHandler }>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={ isBookmarked ? "w-5 h-5 fill-black" : "w-5 h-5 fill-transparent" }
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="square"
            strokeLinejoin="square"
            strokeWidth={2}
            d="M 5 5 v 16 L 5 21 V 5 z L 5 3 H 19 V 5 V 21 L 12 18 L 5 21 V 5"
          />
        </svg>
      </button>
    </div>
  );
}

import React, { useContext } from "react";
import SavedList from "./SavedList";
import ShowSampleButton from "./ShowSampleButton";
import Context from "../store/context";
import { useState, useEffect } from "react";

const lodash = require("lodash");

const SampleList = () => {
  const { sampleVisible, fetchedItems } = useContext(Context);
  const [ sample, setSample ] = useState([]);
  
  useEffect(() => setSample(lodash.sampleSize(fetchedItems, 7)), [fetchedItems]);

  const shuffleHandler = () => {
    setSample(lodash.sampleSize(fetchedItems, 7));
  };

  if (!sampleVisible || fetchedItems.length === 0) {
    window.scrollTo(0, 0);
    return (
      <div className="my-10 ml-8 mr-4">
        <hr className="border-2 border-black" />
        <ShowSampleButton />
      </div>
    );
  }

  return (
    <div className="my-8 ml-8 mr-4">
      <div className="bg-yellow-200 border-[4px] border-black">
        <button className="relative float-right m-2" onClick={shuffleHandler}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 0 24 24"
            width="26px"
            fill="#000000"
          >
            <path strokeWidth={10} d="M0 0h24v24H0z" fill="none" />
            <path strokeWidth={10} d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
          </svg>
        </button>
        <SavedList datas={sample} concise={true} />
      </div>
      <ShowSampleButton />
    </div>
  );
};

export default React.memo(SampleList);

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import React from "react";
import Context from "../store/context";

const FilterButton = (props) => {
  const { selectedItems, setSelectedItems, displayItem, clearSelected } = useContext(Context);
  const [ isSelected, setIsSelected ] = useState(false);
  const [ hide, setHide ] = useState(false);
  const { subredditName } = props;

  const initialState = useRef(true);

  const selectedHandler = useCallback(() => {
    setIsSelected(!isSelected);
  }, [isSelected]);

  useEffect(() => {
    if (isSelected) {
      setSelectedItems(selectedItems.concat(subredditName));
    } else if (initialState.current === true) {
      initialState.current = false;
    } else {
      setSelectedItems(selectedItems.filter((x) => x !== subredditName));
    }
  }, [isSelected, subredditName, setSelectedItems]);
  
  useEffect(() => {
    if ( !displayItem.includes(subredditName) && displayItem.length > 0 ) {
      setHide(true)
    } else if ( displayItem.length === 0 ) {
      setHide(true)
    } else { setHide(false)}
  }, [displayItem, subredditName])
  
  useEffect(() => {
    if (clearSelected) {
      setIsSelected(false);
    }
  }, [clearSelected])

  return (
    <div className={ hide ? "hidden" : "block" }>
      <button
        className={
          !isSelected
            ? "flex-shrink p-2 border-2 border-black font-mono text-sm font-bold tracking-light"
            : "flex-shrink p-2 border-2 border-black font-mono text-sm font-bold tracking-light bg-orange-300"
        }
        onClick={selectedHandler}
      >
        r/{subredditName}
      </button>
    </div>
  );
};

export default React.memo(FilterButton);

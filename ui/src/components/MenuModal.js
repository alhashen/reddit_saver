import { useContext, useEffect, useState } from "react";
import React from "react";
import Context from "../store/context";
import FilterList from "./FilterList";
import FilterSearchBar from "./FilterSearchBar";

const MenuModal = () => {
  const {
    setMenuVisible,
    fetchedItems,
    savedItems,
    setSavedItems,
    subredditKeys,
    isAuthenticated,
  } = useContext(Context);

  const [selectedItems, setSelectedItems] = useState([]);
  const [displayItem, setDisplayItem] = useState([]);
  const [clearToggle, setClearToggle] = useState(false);
  const [clearSelected, setClearSelected] = useState(false);

  useEffect(() => {
    setDisplayItem(subredditKeys);
  }, [subredditKeys]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Context.Provider
      value={{
        displayItem,
        setDisplayItem,
        savedItems,
        setSavedItems,
        fetchedItems,
        selectedItems,
        setSelectedItems,
        subredditKeys,
        clearToggle,
        setClearToggle,
        clearSelected,
        setClearSelected,
      }}
    >
      <div className="fixed w-full h-full z-[100] bg-black opacity-95"></div>
      <div className="w-10/12 p-4 mr-4 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 fixed z-[110] bg-white h-5/6">
        <span className="float-right">
          <button onClick={() => setMenuVisible(false)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </span>
        <FilterSearchBar />
        <div className="grid grid-cols-2 gap-2 h-3/4">
          <FilterList />
          <div className="w-11/12 border-2 border-black grid-rows-4">
            <div className="p-10 border-2 border-black border-dashed">
              <button className="block w-1/2 mx-auto mb-2 font-mono font-bold bg-red-400 border-2 border-black ">
                logout
              </button>
              <button className="block w-1/2 m-auto mb-2 font-mono font-bold bg-blue-400 border-2 border-black ">
                convert
              </button>
              <button className="block w-1/2 m-auto mb-2 font-mono font-bold bg-blue-400 border-2 border-black ">
                sync
              </button>
              <button className="block w-1/2 m-auto mb-2 font-mono font-bold bg-blue-400 border-2 border-black ">
                github
              </button>
            </div>
          </div>
        </div>
      </div>
    </Context.Provider>
  );
};

export default MenuModal;

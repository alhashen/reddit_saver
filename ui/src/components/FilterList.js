import React from "react";
import { useContext, useEffect } from "react";
import Context from "../store/context";
import FilterButton from "./FilterButton";

const FilterList = () => {
  const {
    fetchedItems,
    selectedItems,
    setSelectedItems,
    setSavedItems,
    subredditKeys,
    setClearToggle,
    clearSelected,
    setClearSelected,
  } = useContext(Context);

  useEffect(() => {
    if (selectedItems.length > 0) {
      let filtered = [];
      for (const item of selectedItems) {                  //
        let filter = fetchedItems.filter((data) =>{        //Kalo subreddit ada yg kepilih nanti 
          return data.subreddit === item;                  //bikin array "filtered"
        });                                                //trs ditampilin
        filtered = filtered.concat(filter);                //Sama nampilin clear button di FilterSearchBar
      }                                                   
      setSavedItems(filtered);                             //
      setClearToggle(true);                                //
    } else {                                               //
      setSavedItems(fetchedItems);                         //Kalo ga ada balik ke default
      setClearToggle(false);                               //sama ngerubah state clearSelected ke awal                                 
      setClearSelected(false);                             //biar bisa bersihin daftar selanjutnya
    }
  }, [
    selectedItems,
    fetchedItems,
    setSavedItems,
    setClearToggle,
    setClearSelected
  ]);

  useEffect(() => {                       
    if (clearSelected) {                          
      setSelectedItems([]); 
    }
  }, [clearSelected, setSelectedItems])

  return (
    <div className="py-2 mx-4 overflow-auto no-scrollbar">
    <div className="flex flex-wrap max-h-fit gap-3 ">  
    {subredditKeys.map((data, index) => {
        return <FilterButton key={index} subredditName={data} />;
      })}
    </div>
    </div>
  );
};

export default FilterList;

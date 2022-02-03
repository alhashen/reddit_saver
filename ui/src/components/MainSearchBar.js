import { useState, useContext } from "react";
import Context from "../store/context";

const MainSearchBar = () => {
  const [enteredQuery, setEnteredQuery] = useState("");
  const { fetchedItems, setSavedItems } = useContext(Context);

  const queryInputHandler = (event) => {
    event.preventDefault();
    setEnteredQuery(event.target.value);
  };
  
  const filterHandler = (e) => {
    const qlc = enteredQuery.toLowerCase();
    if (e.keyCode === 13) {
      if (qlc.startsWith("r/")) {
        let parsedQuery = qlc.replace("r/", "");
        let filter = fetchedItems.filter((item) => {
          return item.subreddit.toLowerCase().includes(parsedQuery);
        });
        setSavedItems(filter);
      } else if (qlc.startsWith("t/")) {
        let parsedQuery = qlc.replace("t/", "");
        let filter = fetchedItems.filter((item) => {
          return item.title.toLowerCase().includes(parsedQuery);
        });
        setSavedItems(filter);
      } else if (qlc.startsWith("u/")) {
        let parsedQuery = qlc.replace("u/", "");
        let filter = fetchedItems.filter((item) => {
          return item.author.toLowerCase().includes(parsedQuery);
        });
        setSavedItems(filter);
      } else {
        let filter = fetchedItems.filter((item) => {
          return item.selftext.toLowerCase().includes(qlc);
        });
        setSavedItems(filter);
      }
    }
  };

    return (
      <div className="sticky flex mb-12 z-[10] top-4 place-content-center">
        <input
          type="text"
          onChange={queryInputHandler}
          onKeyDown={filterHandler}
          placeholder=""
          className="w-6/12 px-4 py-2 font-mono tracking-tighter border-[3px] border-black focus:outline-none"
        />
      </div>
    );
};

export default MainSearchBar;

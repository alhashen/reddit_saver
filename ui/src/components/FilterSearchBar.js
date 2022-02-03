import { useContext } from "react";
import Context from "../store/context";

const FilterSearchBar = () => {
  const { setDisplayItem, subredditKeys, clearToggle, setClearSelected } =
    useContext(Context);

  const queryInputHandler = (event) => {
    event.preventDefault();
    const qlc = event.target.value.toLowerCase();
    if (qlc === "") {
      setDisplayItem(subredditKeys);
    }

    let filter = subredditKeys.filter((item) => {
      return item.toLowerCase().includes(qlc); 
    }); 
    if (filter.length > 0) {
      setDisplayItem(filter); 
    } else {
      setDisplayItem([]); 
    }
  };

  return (
    <div className="flex w-3/5 mt-6 mb-6 ml-4">
      <input
        type="text"
        placeholder="filter subreddit"
        onChange={queryInputHandler}
        className="w-6/12 px-4 py-2 font-mono tracking-tighter border-[2px] border-black border-dashed focus:outline-none"
      />

      <span className={clearToggle ? "block" : "hidden"}>
        <button
          className="flex p-1 ml-2"
          onClick={() => {
            setClearSelected(true);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 fill-red-400 stroke-black"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </span>
    </div>
  );
};

export default FilterSearchBar;

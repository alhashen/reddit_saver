import React from "react";
import { useState, useEffect } from "react";
import FetchButton from "./components/FetchButton";
import MainSearchBar from "./components/MainSearchBar";
import MenuButton from "./components/MenuButton";
import SavedList from "./components/SavedList";
import MenuModal from "./components/MenuModal";
import SampleList from "./components/SampleList";
import Context from "./store/context";
import { instance } from "./utils/Utils";
const lodash = require("lodash");

export default function App() {
  // FetchedItems data yang diambil
  // SavedItems data yang ditampilkan

  const [fetchedItems, setFetchedItems] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [sampleVisible, setSampleVisible] = useState(false);
  const [subredditKeys, setSubredditKeys] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const getData = async () => {
      const result = await instance.get("/home");
      const res_status = await result.status;
      console.log(res_status);
      if (res_status === 200 || res_status === 201) {
        setIsAuthenticated(true);
        if (res_status === 201) {
          setFetchedItems(result.data);
          setSavedItems(result.data);
        }
      }
    };
    getData();
  }, []);

  useEffect(() => {
    const slist = lodash.groupBy(fetchedItems, "subreddit");
    const skey = Object.keys(slist).sort();
    setSubredditKeys(skey);
  }, [fetchedItems]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [savedItems]);

  const loginHandler = async () => {
    const result = await instance.get("/login");
    const auth_url = result.data.auth_url;
    window.location.replace(auth_url);
  };

  if (!isAuthenticated) {
      return (
        <React.Fragment>
          <div className="flex font-semibold font-['Helvetica'] tracking-tighter underline decoration-dashed text-6xl place-content-center">
            <h1 className="mt-6 mb-40">rtuumsfsmga</h1>
          </div>
          <div className="w-1/3 ml-auto mr-auto ">
            <button
              onClick={loginHandler}
              className="items-center ml-auto mr-auto border-4 border-black border-dashed hover:border-solid grid grid-cols-2 gap-2"
            >
              <p className="ml-2 mr-auto font-mono text-2xl font-bold underline ">
                login
              </p>
              <span className="ml-auto mr-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="50"
                  height="50"
                  viewBox="0 0 24 24"
                  className="fill-red-400"
                >
                  <path d="M14.558 15.827c.097.096.097.253 0 .349-.531.529-1.365.786-2.549.786l-.009-.002-.009.002c-1.185 0-2.018-.257-2.549-.786-.097-.096-.097-.253 0-.349.096-.096.254-.096.351 0 .433.431 1.152.641 2.199.641l.009.002.009-.002c1.046 0 1.765-.21 2.199-.641.095-.097.252-.097.349 0zm-.126-3.814c-.581 0-1.054.471-1.054 1.05 0 .579.473 1.049 1.054 1.049.581 0 1.054-.471 1.054-1.049 0-.579-.473-1.05-1.054-1.05zm9.568-12.013v24h-24v-24h24zm-4 11.853c0-.972-.795-1.764-1.772-1.764-.477 0-.908.191-1.227.497-1.207-.794-2.84-1.299-4.647-1.364l.989-3.113 2.677.628-.004.039c0 .795.65 1.442 1.449 1.442.798 0 1.448-.647 1.448-1.442 0-.795-.65-1.442-1.448-1.442-.613 0-1.136.383-1.347.919l-2.886-.676c-.126-.031-.254.042-.293.166l-1.103 3.471c-1.892.023-3.606.532-4.867 1.35-.316-.292-.736-.474-1.2-.474-.975-.001-1.769.79-1.769 1.763 0 .647.355 1.207.878 1.514-.034.188-.057.378-.057.572 0 2.607 3.206 4.728 7.146 4.728 3.941 0 7.146-2.121 7.146-4.728 0-.183-.019-.362-.05-.54.555-.299.937-.876.937-1.546zm-9.374 1.21c0-.579-.473-1.05-1.054-1.05-.581 0-1.055.471-1.055 1.05 0 .579.473 1.049 1.055 1.049.581.001 1.054-.47 1.054-1.049z" />
                </svg>
              </span>
            </button>
          </div>
        </React.Fragment>
      );
  }

  return (
    <Context.Provider
      value={{
        fetchedItems,
        setFetchedItems,
        savedItems,
        setSavedItems,
        menuVisible,
        setMenuVisible,
        sampleVisible,
        setSampleVisible,
        subredditKeys,
        isAuthenticated,
      }}
    >
      <div className={menuVisible ? "block" : "hidden"}>
        <MenuModal />
      </div>
      <div className={"float-right p-4 mt-6"}>
        <FetchButton />
        <MenuButton />
      </div>
      <div className="flex font-semibold font-['Helvetica'] tracking-tighter underline decoration-dashed text-6xl place-content-center">
        <h1 className="m-6">rtuumsfsmga</h1>
      </div>

      <MainSearchBar />
      <SampleList />
      <SavedList datas={savedItems} concise={false} />
    </Context.Provider>
  );
}

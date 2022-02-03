import {useContext} from "react";
import Context from "../store/context";

const MenuButton = () => {
  
  const { menuVisible, setMenuVisible } = useContext(Context)

  return (
    <div className="float-right">
      <button onClick={ () => { setMenuVisible(!menuVisible)} }>
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
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    </div>
  );
};

export default MenuButton

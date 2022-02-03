import Masonry from "react-masonry-css";
import SavedComment from "./SavedComment";
import SavedPost from "./SavedPost";
import React, { useCallback, useEffect, useRef, useState } from "react";

const SavedList = (props) => {
  const { datas, concise } = props;
  const [sliceData, setSliceData] = useState(datas);
 
  let isRef = null;
  const observer = useRef();
  const lastIndex = useRef(0);

  const lastItem = useCallback( node => {

    const options = {
      root: null, 
      rootMargin: '0px 0px 800px 0px',
      threshold: 0
    }

    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver( entries => 
      {if (entries[0].isIntersecting){
        setSliceData(datas.slice(0,lastIndex.current+26))
      }}    
    , options);
    if (node) observer.current.observe(node);

  }, [datas])


  useEffect(() => setSliceData(datas.slice(0, 20)), [datas]);

  const breakpoints = {
    default: 3,
    1100: 2,
    700: 1,
  };
  
  return (
    <Masonry
      breakpointCols={breakpoints}
      className="my-masonry-grid "
      columnClassName="my-masonry-grid_column "
    >
      {sliceData.map((data, index) => {
        if (index === sliceData.length - 5) {
          isRef = lastItem;
          lastIndex.current = index;
        } return (
        !data.name.startsWith("t1_") ? (
          <SavedPost
            key={data.id}
            link={data.permalink}
            title={data.title}
            author={data.author}
            subreddit={data.subreddit}
            timestamp={data.created_utc}
            body={ !data.selftext || concise ? ("") : (data.selftext) }
            url={ data.url }
            saved={ data.saved }
            name={ data.name }
            concise={ concise }
            ref={isRef} 
          />
        ) : (
          <SavedComment
            key={data.id}
            link={data.permalink}
            title={data.title}
            author={data.author}
            subreddit={data.subreddit}
            timestamp={data.created_utc}
            body={ !data.selftext || concise ? ("") : (data.selftext) }
            saved={ data.saved }
            name={ data.name }
            ref={isRef} 
          />
        ));
        })}
    </Masonry>
  );
};

export default React.memo(SavedList);

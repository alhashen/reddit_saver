import { forwardRef } from "react";
import ReactMarkdown from "react-markdown";
import BookmarkButton from "./BookmarkButton";

const SavedComment = forwardRef((props, ref) => {
  const { title, body, timestamp, link, saved, subreddit, author, id } = props;
  const parsedDate = new Date(timestamp*1000).toLocaleString();

  return (
    <div>
      <div ref={ref} className="flex-1 p-3 font-mono bg-red-200 border-2 border-black border-dashed hover:border-solid hover:border-3">
        <div className="grid grid-cols-3">
          <div className="h-4 text-xs leading-3 col-span-2">
            <p className="font-bold">r/{subreddit}</p>
            <h1 className="font-thin tracking-tight">by u/{author}</h1>
          </div>
          <BookmarkButton saved={saved} id={id}/>
        </div>

        <a href={link} target="_blank" rel="noreferrer">
          <div>
            <h2 className="mr-2 font-bold leading-5">{title}</h2>
            <p className="text-xs font-thin tracking-tighter">{parsedDate}</p>
            <div className="p-2 overflow-hidden text-sm text-center">
              <ReactMarkdown>
                {body.length < 499 ? body : body + "..."}
              </ReactMarkdown>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
})

export default SavedComment;


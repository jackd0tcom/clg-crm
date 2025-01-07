const WriterTitle = ({ handleTitleChange, storyTitle }) => {
  return (
    <>
      {" "}
      <textarea
        className="story-title"
        name="storyTitle"
        id="storyTitle"
        value={storyTitle}
        placeholder="Title"
        onChange={handleTitleChange}
      ></textarea>
    </>
  );
};

export default WriterTitle;

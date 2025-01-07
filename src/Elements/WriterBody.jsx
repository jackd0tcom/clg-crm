const WriterBody = ({ handleContentChange, storyContent }) => {
  return (
    <>
      <textarea
        name="storyContent"
        id="storyContent"
        placeholder="Once upon a time..."
        spellCheck="false"
        autoCapitalize="false"
        autoComplete="false"
        value={storyContent}
        onChange={handleContentChange}
      ></textarea>
    </>
  );
};

export default WriterBody;

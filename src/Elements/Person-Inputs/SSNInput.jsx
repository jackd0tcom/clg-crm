import InputMask from "react-input-mask";

const SSNInput = ({
  input,
  setInput,
  handleBlur,
  handleEnter,
  inputRef,
  setCount,
}) => {
  return (
    <InputMask
      className="person-input-field"
      mask="999 99 9999"
      value={input}
      onChange={(e) => {
        setInput(e.target.value);
        setCount((prevCount) => prevCount + 1);
      }}
      inputRef={inputRef}
      onBlur={handleBlur}
      onKeyDown={handleEnter}
    ></InputMask>
  );
};
export default SSNInput;

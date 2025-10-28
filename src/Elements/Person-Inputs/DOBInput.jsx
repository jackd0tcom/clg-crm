import InputMask from "react-input-mask";

const DOBInput = ({
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
      mask="9999-99-99"
      value={input}
      onChange={(e) => {
        console.log(e.target.value);
        setInput(e.target.value);
        setCount((prevCount) => prevCount + 1);
      }}
      inputRef={inputRef}
      onBlur={handleBlur}
      onKeyDown={handleEnter}
      placeholder={"1999-01-01"}
    ></InputMask>
  );
};
export default DOBInput;

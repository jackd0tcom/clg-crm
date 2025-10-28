import InputMask from "react-input-mask";

const PhoneInput = ({
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
      mask="(999) 999 - 9999"
      value={input}
      onChange={(e) => {
        console.log(e.target.value);
        setInput(e.target.value);
        setCount((prevCount) => prevCount + 1);
      }}
      inputRef={inputRef}
      onBlur={handleBlur}
      onKeyDown={handleEnter}
    ></InputMask>
  );
};
export default PhoneInput;

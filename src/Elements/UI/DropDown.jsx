const DropDown = ({ setIsVisible, data, value, setValue, handleClick }) => {
  return (
    <div className="drop-down-wrapper">
      {data.map((piece) => {
        return (
          <div
            key={piece}
            onClick={() => {
              setValue(piece);
              handleClick(piece);
              setIsVisible(false);
            }}
            className="drop-down-item"
          >
            {piece}
          </div>
        );
      })}
    </div>
  );
};
export default DropDown;

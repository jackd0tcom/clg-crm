const Confirm = ({ message, handleConfirm, setConfirm }) => {
  return (
    <div className="confirm-modal-wrapper">
      <p>Are you sure you want to {message}</p>
      <div className="confirm-modal-buttons">
        <button
          id="cancel"
          onClick={() => {
            setConfirm(false);
          }}
        >
          Cancel
        </button>
        <button
          id="confirm"
          onClick={() => {
            handleConfirm();
            setConfirm(false);
          }}
        >
          Confirm
        </button>
      </div>
    </div>
  );
};
export default Confirm;

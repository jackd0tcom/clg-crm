const Loader = () => {
  let showLoader = false;

  setTimeout(() => {
    showLoader = true;
  }, 100);
  return (
    <div className="loader-wrapper">
      {showLoader && (
        <div className="lds-ring">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      )}
    </div>
  );
};

export default Loader;

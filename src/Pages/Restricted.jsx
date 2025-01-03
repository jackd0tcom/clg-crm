import { useNavigate } from "react-router";

const Restricted = () => {
  const navigate = useNavigate();
  return (
    <>
      <h1>Sorry, the story you do not have access to that story!</h1>
      <button
        onClick={() => {
          navigate("/stories");
        }}
      >
        See my stories
      </button>
    </>
  );
};

export default Restricted;

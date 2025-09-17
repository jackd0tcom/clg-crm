import { capitalize } from "../helpers/helperFunctions";

const PhaseIcon = ({ phase }) => {
  const icons = {
    intake: <i className="fa-solid fa-pencil"></i>,
    investigation: <i className="fa-solid fa-magnifying-glass"></i>,
    negotiation: <i className="fa-solid fa-comments"></i>,
    litigation: <i className="fa-solid fa-gavel"></i>,
    settlement: <i className="fa-solid fa-coins"></i>,
    closed: <i className="fa-solid fa-briefcase"></i>,
  };

  return (
    <div className="phase-icon-wrapper">
      {icons[phase]}
      <p>{capitalize(phase)}</p>
    </div>
  );
};
export default PhaseIcon;

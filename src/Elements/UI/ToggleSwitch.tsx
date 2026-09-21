interface props {
  name: string;
  options: any;
  onClick: any;
  checked: any;
  disabled?: any;
}

const ToggleSwitch = ({ name, options, onClick, checked, disabled }: props) => {
  return (
    <div className="toggle-switch-wrapper toggle-container">
      <p>{options[0]}</p>
      <label htmlFor={`toggle-switch-${name}`} className="switch">
        <input
          type="checkbox"
          onChange={onClick}
          name={`toggle-switch-${name}`}
          id={`toggle-switch-${name}`}
          checked={checked}
          disabled={disabled}
        />
        <span className="slider round"></span>
      </label>
      <p>{options[1]}</p>
    </div>
  );
};

export default ToggleSwitch;

import DropDown from "./DropDown";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

const ExtraSettings = ({
  Id,
  handleRefresh,
  refreshActivityData,
  isArchived,
  setIsArchived,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [value, setValue] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  const handleArchive = async () => {
    console.log("clicked");
    let caseId = Id;
    try {
      await axios.get(`/api/archiveCase/${caseId}`).then((res) => {
        if (res.data[0] === "0") {
          setIsArchived(false);
        } else if (res.data[0] === "1") {
          setIsArchived(true);
        }
        handleRefresh();
        refreshActivityData();
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleBlur = () => {
    setIsVisible(false);
  };

  return (
    <div className="extra-settings-wrapper" ref={dropdownRef}>
      {isVisible ? (
        <DropDown
          isVisible={isVisible}
          setIsVisible={setIsVisible}
          data={!isArchived ? ["Archive Case"] : ["Remove From Archive"]}
          value={value}
          setValue={setValue}
          handleClick={handleArchive}
        />
      ) : (
        <a
          onClick={() => {
            setIsVisible(true);
          }}
        >
          ...
        </a>
      )}
    </div>
  );
};
export default ExtraSettings;

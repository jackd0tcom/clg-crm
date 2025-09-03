import DropDown from "./DropDown";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

const ExtraSettings = ({
  Id,
  taskId,
  handleRefresh,
  refreshActivityData,
  isArchived,
  setIsArchived,
  handleClose,
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
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible]);

  const handleArchive = async () => {
    console.log("clicked");
    let caseId = Id;
    try {
      await axios.get(`/api/archiveCase/${caseId}`).then((res) => {
        // The endpoint returns "0 case unarchived" or "1 case archived"
        const isArchived = res.data.startsWith("1");
        setIsArchived(isArchived);
        handleRefresh();
        refreshActivityData();
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async () => {
    console.log("delete");
    try {
      await axios
        .delete("/api/deleteTask", { data: { taskId } })
        .then((res) => {
          handleClose();
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
        !taskId ? (
          <DropDown
            isVisible={isVisible}
            setIsVisible={setIsVisible}
            data={!isArchived ? ["Archive Case"] : ["Remove From Archive"]}
            value={value}
            setValue={setValue}
            handleClick={handleArchive}
          />
        ) : (
          <DropDown
            isVisible={isVisible}
            setIsVisible={setIsVisible}
            data={["Delete Task"]}
            value={value}
            setValue={setValue}
            handleClick={handleDelete}
          />
        )
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

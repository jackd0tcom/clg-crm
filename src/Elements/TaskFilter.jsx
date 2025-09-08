import { useState, useRef, useEffect } from "react";
import axios from "axios";

const TaskFilter = ({ tasks, setTasks, paramCase }) => {
  const [byCase, setByCase] = useState(false);
  const [caseData, setCaseData] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [originalTasks, setOriginalTasks] = useState([]);
  const dropdownRef = useRef(null);
  const hasAppliedUrlFilter = useRef(false);

  const truncateTitle = (title) => {
    if (title && title.length > 22) {
      return title.substring(0, 22) + "...";
    }
    return title;
  };
  const truncateTitleLonger = (title) => {
    if (title && title.length > 30) {
      return title.substring(0, 30) + "...";
    }
    return title;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setByCase(false);
      }
    };

    if (byCase) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [byCase]);

  const fetchCases = async () => {
    try {
      await axios.get("/api/getCases").then((res) => {
        setCaseData(res.data);
        if (paramCase !== 0) {
          const currentCase = res.data.find(
            (data) => data.caseId === paramCase
          );
          if (currentCase) {
            handleCaseClick(currentCase);
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (filteredCases.length === 0) {
      setTasks(originalTasks);
    } else {
      const caseIds = filteredCases.map((cas) => cas.caseId);

      const filteredTasks = originalTasks.filter((task) => {
        return (
          task.case && task.case.caseId && caseIds.includes(task.case.caseId)
        );
      });
      setTasks(filteredTasks);
    }
  }, [filteredCases, originalTasks]);

  useEffect(() => {
    if (tasks.length > 0 && originalTasks.length === 0) {
      setOriginalTasks(tasks);
    }
  }, [tasks, originalTasks.length]);

  useEffect(() => {
    fetchCases();
  }, []);

  useEffect(() => {
    if(paramCase && paramCase.caseId && paramCase.caseId !== '0' && originalTasks.length > 0 && !hasAppliedUrlFilter.current) {
      // Auto-filter tasks by case when caseId is provided in URL (only once)
      hasAppliedUrlFilter.current = true;
      axios.get(`/api/getCase/${paramCase.caseId}`).then((res) => {
        handleCaseClick(res.data);
      });
    } else if (!paramCase || !paramCase.caseId || paramCase.caseId === '0') {
      // Clear filters when no caseId or caseId is '0'
      hasAppliedUrlFilter.current = false;
      setFilteredCases([]);
      setTasks(originalTasks);
    }
  }, [paramCase?.caseId, originalTasks.length]);

  const handleCaseClick = (ca) => {
    setFilteredCases((prevList) => {
      const isAlreadyFiltered = prevList.some((c) => c.caseId === ca.caseId);

      if (isAlreadyFiltered) {
        return prevList.filter((c) => c.caseId !== ca.caseId);
      } else {
        return [...prevList, ca];
      }
    });
  };

  const clearAllFilters = () => {
    setFilteredCases([]);
  };

  return (
    <div className="task-filter-wrapper">
      <div className="filter-header">
        <button
          className="tasks-case-filter-button"
          onClick={() => setByCase(true)}
        >
          Filter By Case
        </button>
        {filteredCases.length > 0 && (
          <div className="active-filters">
            {filteredCases.map((ca) => (
              <p
                key={ca.caseId}
                className="filter-tag"
                onClick={() => handleCaseClick(ca)}
                title={ca.title} // Show full title on hover
              >
                {truncateTitle(ca.title)} x
              </p>
            ))}
          </div>
        )}
      </div>

      {byCase && (
        <div className="task-filter-dropdown" ref={dropdownRef}>
          {caseData
            .filter((ca) => !filteredCases.some((c) => c.caseId === ca.caseId))
            .map((ca) => (
              <p
                key={ca.caseId}
                onClick={() => handleCaseClick(ca)}
                className="dropdown-case-item"
                title={ca.title} // Show full title on hover
              >
                {truncateTitleLonger(ca.title)}
              </p>
            ))}
        </div>
      )}
    </div>
  );
};
export default TaskFilter;

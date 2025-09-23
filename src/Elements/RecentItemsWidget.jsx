import React, { useState, useEffect } from "react";
import { getRecentItems, clearRecentItems } from "../helpers/recentItemsHelper";
import { findTimeDifference } from "../helpers/helperFunctions";
import StatusIcon from "./StatusIcon";
import PriorityIcon from "./PriorityIcon";
import PhaseIcon from "./PhaseIcon";

const RecentItemsWidget = ({ openTaskView, navigate }) => {
  const [recentItems, setRecentItems] = useState([]);

  useEffect(() => {
    // Load recent items on component mount
    const items = getRecentItems();
    setRecentItems(items);
  }, []);

  const handleItemClick = (item) => {
    if (item.itemType === "task") {
      // Open the task view
      if (openTaskView) {
        openTaskView(item);
      }
    } else if (item.itemType === "case") {
      // Navigate to the case
      if (navigate) {
        navigate(`/case/${item.caseId}`);
      }
    }
  };

  const handleClearHistory = () => {
    clearRecentItems();
    setRecentItems([]);
  };

  if (recentItems.length === 0) {
    return (
      <div className="widget-container">
        <p>Recent Items</p>
        <div className="recent-items-container">
          <p className="no-recent-items">No recent items</p>
        </div>
      </div>
    );
  }

  return (
    <div className="widget-container">
      <div className="widget-header">
        <p id="recent-items">Recents</p>
        {recentItems.length > 0 && (
          <button
            className="clear-history-btn"
            onClick={handleClearHistory}
            title="Clear recent items"
          >
            Clear
          </button>
        )}
      </div>
      <div className="recent-items-container">
        {recentItems.map((item) => (
          <div
            key={`${item.itemType}-${item.itemId}`}
            className="recent-item"
            onClick={() => handleItemClick(item)}
          >
            <div className="recent-item-content">
              <div className="recent-item-header">
                {item.itemType === "task" ? (
                  <StatusIcon
                    status={item.status}
                    hasIcon={true}
                    hasTitle={false}
                    noBg={true}
                  />
                ) : (
                  <i className="fa-solid fa-briefcase"></i>
                )}
                <h4 className="recent-item-title">{item.title}</h4>
              </div>
            </div>

            <div className="recent-item-status">
              {item.itemType === "task" && (
                <PriorityIcon data={item.priority} />
              )}
              {item.itemType === "case" && (
                <span className="case-owner">
                  <PhaseIcon phase={item.phase} />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentItemsWidget;

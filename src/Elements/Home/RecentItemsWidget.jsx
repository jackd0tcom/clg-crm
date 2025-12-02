import React, { useState, useEffect } from "react";
import {
  getRecentItems,
  clearRecentItems,
  updateRecentItem,
} from "../../helpers/recentItemsHelper";
import { findTimeDifference } from "../../helpers/helperFunctions";
import StatusIcon from "../Task/StatusIcon";
import PriorityIcon from "../Task/PriorityIcon";
import PhaseIcon from "../Case/PhaseIcon";
import axios from "axios";

const RecentItemsWidget = ({ openTaskView, navigate, refreshTrigger }) => {
  const [recentItems, setRecentItems] = useState([]);

  useEffect(() => {
    // Load recent items on component mount
    const items = getRecentItems();
    setRecentItems(items);
  }, []);

  // Refresh recent items when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0 && recentItems.length > 0) {
      refreshRecentItems();
    }
  }, [refreshTrigger]);

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

  const refreshRecentItems = async () => {
    try {
      const currentItems = getRecentItems();
      const updatedItems = [...currentItems];

      // Update task data for all recent tasks
      for (let i = 0; i < updatedItems.length; i++) {
        const item = updatedItems[i];
        if (item.itemType === "task") {
          try {
            const response = await axios.get(`/api/getTask/${item.taskId}`);
            const updatedTask = response.data;

            // Update the item with fresh task data
            updatedItems[i] = {
              ...item,
              ...updatedTask,
              itemType: "task",
              itemId: updatedTask.taskId,
            };
          } catch (error) {
            console.log(`Could not refresh task ${item.taskId}:`, error);
            // Keep the existing item if we can't fetch updated data
          }
        }
      }

      // Update localStorage with fresh data
      localStorage.setItem("recentItems", JSON.stringify(updatedItems));
      setRecentItems(updatedItems);
    } catch (error) {
      console.log("Error refreshing recent items:", error);
    }
  };

  if (recentItems.length === 0) {
    return (
      <div className="widget-container">
        <p>Recents</p>
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

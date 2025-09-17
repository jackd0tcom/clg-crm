import React, { useState, useEffect } from 'react';
import { getRecentItems, clearRecentItems } from '../helpers/recentItemsHelper';
import { findTimeDifference } from '../helpers/helperFunctions';


const RecentItemsWidget = ({ openTaskView, navigate }) => {
  const [recentItems, setRecentItems] = useState([]);

  useEffect(() => {
    // Load recent items on component mount
    const items = getRecentItems();
    setRecentItems(items);
  }, []);

  const handleItemClick = (item) => {
    if (item.itemType === 'task') {
      // Open the task view
      if (openTaskView) {
        openTaskView(item);
      }
    } else if (item.itemType === 'case') {
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
        <p>Recent Items</p>
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
                <span className={`item-type-badge item-type-${item.itemType}`}>
                  {item.itemType === 'task' ? 'Task' : 'Case'}
                </span>
                <h4 className="recent-item-title">{item.title}</h4>
              </div>
              
              {item.itemType === 'task' && (
                <>
                  {item.case && (
                    <p className="recent-item-case">{item.case.title}</p>
                  )}
                  <div className="recent-item-meta">
                    <span className={`priority-badge priority-${item.priority?.toLowerCase()}`}>
                      {item.priority}
                    </span>
                    {item.dueDate && (
                      <span className="due-date">
                        {findTimeDifference(item.dueDate).replace(/^[012]/, '')}
                      </span>
                    )}
                  </div>
                </>
              )}
              
              {item.itemType === 'case' && (
                <div className="recent-item-meta">
                  <span className="case-phase">{item.phase}</span>
                </div>
              )}
            </div>
            
            <div className="recent-item-status">
              {item.itemType === 'task' && (
                <span className={`status-badge status-${item.status?.toLowerCase()}`}>
                  {item.status}
                </span>
              )}
              {item.itemType === 'case' && (
                <span className="case-owner">
                  {item.owner?.firstName} {item.owner?.lastName}
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

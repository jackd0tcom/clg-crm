/**
 * Recent Items Helper
 * Manages recently viewed tasks and cases using localStorage
 */

const RECENT_ITEMS_KEY = 'recentItems';
const MAX_RECENT_ITEMS = 8; // Increased to accommodate both tasks and cases

/**
 * Add an item (task or case) to the recent items list
 * @param {Object} item - The task or case object to add
 * @param {string} type - The type of item ('task' or 'case')
 */
export const addRecentItem = (item, type) => {
  try {
    const recentItems = getRecentItems();
    
    // Create a unified item object with type
    const itemWithType = {
      ...item,
      itemType: type,
      itemId: type === 'task' ? item.taskId : item.caseId
    };
    
    // Remove the item if it already exists (to avoid duplicates)
    const filteredItems = recentItems.filter(i => 
      !(i.itemType === type && i.itemId === itemWithType.itemId)
    );
    
    // Add the new item to the front and limit to MAX_RECENT_ITEMS
    const updatedItems = [itemWithType, ...filteredItems].slice(0, MAX_RECENT_ITEMS);
    
    // Store in localStorage
    localStorage.setItem(RECENT_ITEMS_KEY, JSON.stringify(updatedItems));
    
    return updatedItems;
  } catch (error) {
    console.error('Error adding recent item:', error);
    return getRecentItems();
  }
};

/**
 * Add a task to the recent items list (backward compatibility)
 * @param {Object} task - The task object to add
 */
export const addRecentTask = (task) => {
  return addRecentItem(task, 'task');
};

/**
 * Get all recent items from localStorage
 * @returns {Array} Array of recent item objects
 */
export const getRecentItems = () => {
  try {
    const stored = localStorage.getItem(RECENT_ITEMS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting recent items:', error);
    return [];
  }
};

/**
 * Get all recent tasks from localStorage (backward compatibility)
 * @returns {Array} Array of recent task objects
 */
export const getRecentTasks = () => {
  return getRecentItems().filter(item => item.itemType === 'task');
};

/**
 * Remove a specific item from recent items
 * @param {number} itemId - The ID of the item to remove
 * @param {string} type - The type of item ('task' or 'case')
 */
export const removeRecentItem = (itemId, type) => {
  try {
    const recentItems = getRecentItems();
    const filteredItems = recentItems.filter(i => 
      !(i.itemType === type && i.itemId === itemId)
    );
    localStorage.setItem(RECENT_ITEMS_KEY, JSON.stringify(filteredItems));
    return filteredItems;
  } catch (error) {
    console.error('Error removing recent item:', error);
    return getRecentItems();
  }
};

/**
 * Remove a specific task from recent tasks (backward compatibility)
 * @param {number} taskId - The ID of the task to remove
 */
export const removeRecentTask = (taskId) => {
  return removeRecentItem(taskId, 'task');
};

/**
 * Clear all recent items
 */
export const clearRecentItems = () => {
  try {
    localStorage.removeItem(RECENT_ITEMS_KEY);
    return [];
  } catch (error) {
    console.error('Error clearing recent items:', error);
    return getRecentItems();
  }
};

/**
 * Clear all recent tasks (backward compatibility)
 */
export const clearRecentTasks = () => {
  return clearRecentItems();
};

/**
 * Update an item in the recent items list (useful when item data changes)
 * @param {Object} updatedItem - The updated item object
 * @param {string} type - The type of item ('task' or 'case')
 */
export const updateRecentItem = (updatedItem, type) => {
  try {
    const recentItems = getRecentItems();
    const itemId = type === 'task' ? updatedItem.taskId : updatedItem.caseId;
    const itemIndex = recentItems.findIndex(i => 
      i.itemType === type && i.itemId === itemId
    );
    
    if (itemIndex !== -1) {
      recentItems[itemIndex] = { ...recentItems[itemIndex], ...updatedItem };
      localStorage.setItem(RECENT_ITEMS_KEY, JSON.stringify(recentItems));
    }
    
    return recentItems;
  } catch (error) {
    console.error('Error updating recent item:', error);
    return getRecentItems();
  }
};

/**
 * Update a task in the recent tasks list (backward compatibility)
 * @param {Object} updatedTask - The updated task object
 */
export const updateRecentTask = (updatedTask) => {
  return updateRecentItem(updatedTask, 'task');
};

/**
 * Get the count of recent items
 * @returns {number} Number of recent items
 */
export const getRecentItemsCount = () => {
  return getRecentItems().length;
};

/**
 * Get the count of recent tasks (backward compatibility)
 * @returns {number} Number of recent tasks
 */
export const getRecentTasksCount = () => {
  return getRecentTasks().length;
};

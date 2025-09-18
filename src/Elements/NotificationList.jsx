import NotificationItem from "./NotificationItem";

const NotificationList = ({
  notifications,
  handleRead,
  handleCleared,
  openTaskView,
}) => {
  return (
    <div className="notification-list-wrapper">
      {notifications.length > 0 ? (
        notifications.map((item) => {
          return (
            <NotificationItem
              key={item.notificationId}
              data={item}
              openTaskView={openTaskView}
              handleRead={handleRead}
              handleCleared={handleCleared}
            />
          );
        })
      ) : (
        <div className="caught-up">
          <i className="fa-solid fa-inbox"></i>
          <p>You're all caught up!</p>
        </div>
      )}
    </div>
  );
};
export default NotificationList;

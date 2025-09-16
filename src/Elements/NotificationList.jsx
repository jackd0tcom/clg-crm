import NotificationItem from "./NotificationItem";

const NotificationList = ({ notifications, handleRead, openTaskView }) => {
  return (
    <div className="notification-list-wrapper">
      {notifications &&
        notifications.map((item) => {
          return (
            <NotificationItem
              data={item}
              openTaskView={openTaskView}
              handleRead={handleRead}
            />
          );
        })}
    </div>
  );
};
export default NotificationList;

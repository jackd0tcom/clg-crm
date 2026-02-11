const getDurationNumber = (entry) => {
  const timeDifference =
    Math.floor(new Date(entry.endTime).getTime() / 1000) -
    Math.floor(new Date(entry.startTime).getTime() / 1000);

  return timeDifference;
};
const TimeKeeperStats = ({ entries }) => {
  const totalSeconds = entries.reduce(
    (acc, entry) => acc + getDurationNumber(entry),
    0,
  );

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor((totalSeconds % 3600) % 60);

  const totalTime = `${hours > 0 ? hours : "0"}:${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  return (
    <div className="time-keeper-stats-wrapper">
      <div className="time-keeper-stat">
        <p className="time-keeper-stat-heading">Entries</p>
        <p>{entries?.length}</p>
      </div>
      <div className="time-keeper-stat">
        <p className="time-keeper-stat-heading">Total Time</p>
        <p>{totalTime}</p>
      </div>
    </div>
  );
};
export default TimeKeeperStats;

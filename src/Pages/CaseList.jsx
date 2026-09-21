import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import CaseCard from "../Elements/CaseList/CaseCard";
import CaseFilter from "../Elements/CaseList/CaseFilter";
import CaseListSearch from "../Elements/CaseList/CaseListSearch";
import Loader from "../Elements/UI/Loader";
import { useSelector } from "react-redux";
import { usePersistedFilter } from "../Hooks/usePersistedFilter";
import Sorter from "../Elements/UI/Sorter";
import ToggleSwitch from "../Elements/UI/ToggleSwitch";

const CaseList = ({ openTaskView, refreshKey }) => {
  const navigate = useNavigate();
  const userStore = useSelector((state) => state.user);
  const [cases, setCases] = useState([]);
  const [originalCases, setOriginalCases] = useState();
  const [allCases, setAllCases] = useState();
  const [isFetched, setIsFetched] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [archivedCases, setArchivedCases] = useState([]);
  const [nonArchivedCases, setNonArchivedCases] = useState([]);
  const [oldestFirst, setOldestFirst] = useState([]);
  const [openCases, setOpenCases] = useState(0);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = usePersistedFilter("cases", userStore.userId, {
    sort: "",
    direction: "up",
    showAll: false,
  });

  const fetchCases = async () => {
    try {
      const res = await axios.get("/api/getCasesWithTasks");
      setOpenCases(res.data.count);
      const allCases = res.data.cases?.length > 0 ? res.data.cases : [];
      setCases(allCases);

      // nonArchived cases === last updated cases that user is assigned to
      setNonArchivedCases(
        nonArchivedCases.filter((ca) =>
          ca.assignees?.some((nee) => nee.userId === userStore.userId),
        ),
      );
      // oldest first cases
      setOldestFirst(
        nonArchivedCases
          .filter((ca) =>
            ca.assignees?.some((nee) => nee.userId === userStore.userId),
          )
          .reverse(),
      );
      // archived cases
      setArchivedCases(archivedCases);
      //
      setOriginalCases(
        res.data.cases.filter((ca) =>
          ca.assignees?.some((nee) => nee.userId === userStore.userId),
        ),
      ); // Keep original data for filtering
      setIsFetched(true);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (userStore.userId) {
      fetchCases();
    }
  }, [userStore.userId]);

  useEffect(() => {
    if (refreshKey > 0) {
      fetchCases();
    }
  }, [refreshKey]);

  const filteredCases = useMemo(() => {
    let data = cases;
    const archivedCases = data.filter((a) => a.isArchived);
    const nonArchivedCases = data.filter((a) => !a.isArchived);

    if (filter.sort === "archived") {
      data = archivedCases;
    } else data = nonArchivedCases;

    const myCases = data.filter((ca) =>
      ca.assignees?.some((nee) => nee.userId === userStore.userId),
    );

    if (!filter.showAll) {
      data = myCases;
    }

    const searchQuery = search.toLowerCase();

    // Search filtering
    if (searchQuery.trim() !== "") {
      data = data.filter((cas) => {
        if (cas.title.toLowerCase().includes(searchQuery)) return true;
        if (cas.phase.toLowerCase().includes(searchQuery)) return true;
        if (
          cas.practiceAreas.find((area) =>
            area.name.toLowerCase().includes(searchQuery),
          )
        )
          return true;
        else return false;
      });
    }

    if (filter.sort !== "") {
      data = data.sort((a, b) => {
        switch (filter.sort) {
          case "dateUpdated":
            return filter.direction !== "up"
              ? new Date(a.updatedAt).getTime() -
                  new Date(b.updatedAt).getTime()
              : new Date(b.updatedAt).getTime() -
                  new Date(a.updatedAt).getTime();

          case "dateCreated":
            return filter.direction !== "up"
              ? new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
              : new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime();

          default:
            break;
        }
      });
    } else
      data = data.sort((a, b) => {
        return filter.direction !== "up"
          ? new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });

    return data;
  }, [filter, cases, search]);

  return !isFetched ? (
    <Loader />
  ) : (
    <div className="case-list-wrapper">
      <div className="case-list-head">
        <div className="case-list-head-heading-wrapper">
          <h1 className="section-heading">My Cases</h1>
          <div className="case-count-wrapper">
            <p className="case-count">{openCases} Open Cases</p>
          </div>
        </div>
        <ToggleSwitch
          options={["Show Mine", "Show All"]}
          checked={filter.showAll}
          onClick={() =>
            filter.showAll
              ? setFilter({ ...filter, showAll: false })
              : setFilter({ ...filter, showAll: true })
          }
        />
        <Sorter
          filter={filter}
          setFilter={setFilter}
          options={[
            {
              heading: "Date Updated",
              sortHeading: "sort",
              sortValue: "dateUpdated",
            },
            {
              heading: "Date Opened",
              sortHeading: "sort",
              sortValue: "dateCreated",
            },
            {
              heading: "Archived",
              sortHeading: "sort",
              sortValue: "archived",
            },
          ]}
          direction="direction"
          position="left"
        />
        <CaseListSearch search={search} setSearch={setSearch} />
        <a
          className="button button-primary add-case-button"
          onClick={() => navigate("/case/0")}
        >
          Open Case
        </a>
      </div>
      <div className="case-list">
        {filteredCases.length > 0 ? (
          filteredCases.map((data) => {
            return (
              <CaseCard
                key={data.caseId}
                data={data}
                openTaskView={openTaskView}
              />
            );
          })
        ) : (
          <div className="no-active-cases">
            <i className="fa-regular fa-folder-open"></i>
            <div>
              <h2>No Open Cases</h2>
              <p>
                Open a new one, or toggle archived cases above to see archived
                cases
              </p>
            </div>
            <a
              className="button button-primary add-case-button"
              onClick={() => navigate("/case/0")}
            >
              Open Case
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseList;

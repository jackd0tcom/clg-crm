import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { getInvoiceStatementItemFromInvoice } from "../helpers/helperFunctions";
import Loader from "../Elements/UI/Loader";
import FilterDropdown from "../Elements/UI/FilterDropdown";
import { usePersistedFilter } from "../Hooks/usePersistedFilter";
import { useSelector } from "react-redux";
import PaymentList from "../Elements/Statements/PaymentList";
import { buildFilters, formatDateNoTime } from "../helpers/helperFunctions";
import FilterDateRangeSelector from "../Elements/TimeKeeper/FilterDateRangeSelector";
import PDFStatement from "../Elements/PDF/PDFStatement";
import createAndDownloadMonthlyStatementZip from "../Elements/PDF/createAndDownloadMonthlyStatementZip";

const Statements = () => {
  const [paymentList, setPaymentList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const userStore = useSelector((state: any) => state.user);
  const [dates, setDates] = useState<any>([]);
  const [clients, setClients] = useState<any>([]);
  const [description, setDescription] = useState<any>([]);
  const [showPDF, setShowPDF] = useState(false);
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const [zipStatus, setZipStatus] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [combinedItems, setCombinedItems] = useState<any>([]);
  const dropdownRef = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = usePersistedFilter(
    "statements",
    userStore.userId,
    {
      sort: "",
      date: [],
      client: [],
      description: [],
      direction: "up",
      dateRange: {
        startDate: firstDay,
        endDate: lastDay,
      },
    },
  );

  const fetchPayments = async () => {
    try {
      await axios.get("/api/getPayments").then((res: any) => {
        if (res.status === 200) {
          const payments = res.data.payments;
          const invoices = res.data.invoices;
          const invoiceItems = getInvoiceStatementItemFromInvoice(invoices);
          setPaymentList(payments);
          setCombinedItems([...payments, ...invoiceItems]);
          setDates(
            buildFilters(
              payments,
              (item: any) => item.paidDate?.slice(0, 7), // unique key: "2024-03"
              (item: any) => {
                const [year, month] = item.paidDate.split("-");
                return `${month}/${year}`; // display: "03/2024"
              },
            ),
          );
          setClients(
            buildFilters(payments, "personId", (p: any) =>
              `${p.person?.firstName ?? ""} ${p.person?.lastName ?? ""}`.trim(),
            ),
          );
          setDescription(buildFilters(payments, "description", "description"));
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchPayments();
    }, 100);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const filteredPayments = useMemo(() => {
    let data = combinedItems;

    data = data.filter((payment: any) => {
      const rangeStart = filter.dateRange.startDate
        ? new Date(filter.dateRange.startDate)
        : null;
      const rangeEnd = filter.dateRange.endDate
        ? new Date(filter.dateRange.endDate)
        : null;
      if (
        rangeStart &&
        payment.paidDate &&
        payment.paidDate < rangeStart.toISOString()
      ) {
        return false;
      }
      if (
        rangeEnd &&
        payment.paidDate &&
        payment.paidDate > rangeEnd.toISOString()
      ) {
        return false;
      }
      if (filter.date.length > 0) {
        if (
          !filter.date.some(
            (filter: any) => filter.id === payment.paidDate?.slice(0, 7),
          )
        )
          return false;
      }
      if (filter.client.length > 0) {
        if (
          !filter.client.some(
            (filter: any) =>
              filter.title ===
              `${payment.person?.firstName ?? ""} ${payment.person?.lastName ?? ""}`.trim(),
          )
        )
          return false;
      }
      if (filter.description.length > 0) {
        if (
          !filter.description.some(
            (filter: any) => filter.id === payment.description,
          )
        )
          return false;
      }

      return payment;
    });

    return data;
  }, [filter, paymentList]);

  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const handleZip = async () => {
    setShowDropdown(false);
    setZipStatus("Creating invoices…");
    try {
      await createAndDownloadMonthlyStatementZip({
        startDate: filter.dateRange.startDate,
        endDate: filter.dateRange.endDate,
        setZipStatus,
      });
      await delay(3000);
      setZipStatus("");
    } catch (err) {
      console.error(err);
      setZipStatus("Error — try again");
    }
  };

  return (
    <div className="statements-page-wrapper">
      <div className="page-header">
        <h2 className="section-heading">Statements</h2>
        <div className="relative">
          <div className=""></div>
          <button
            className="new-invoice-button"
            onClick={() => {
              showPDF ? setShowPDF(false) : setShowDropdown(!showDropdown);
            }}
          >
            {zipStatus !== ""
              ? zipStatus
              : showPDF
                ? "View Statements"
                : "Create PDF"}
          </button>
          {showDropdown && (
            <div className="dropdown right" ref={dropdownRef}>
              <div className="dropdown-item dropdown-header">
                {formatDateNoTime(filter.dateRange.startDate)} -{" "}
                {formatDateNoTime(filter.dateRange.endDate)}
              </div>
              <div onClick={() => handleZip()} className="dropdown-item">
                Download PDFs
              </div>
              <div
                onClick={() => {
                  setShowPDF(!showPDF);
                  setShowDropdown(false);
                }}
                className="dropdown-item"
              >
                View PDF
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="statements-page-body">
        {isLoading ? (
          <Loader />
        ) : showPDF ? (
          <div className="statement-pdf-wrapper">
            <PDFStatement statementData={null} statements={filteredPayments} />
          </div>
        ) : (
          <div className="statements-list">
            <div className="payment-item statement-list-head">
              <FilterDateRangeSelector filter={filter} setFilter={setFilter} />
              <FilterDropdown
                filter={filter}
                setFilter={setFilter}
                options={clients}
                array={true}
                heading="Client"
              />
              <FilterDropdown
                filter={filter}
                setFilter={setFilter}
                options={description}
                array={true}
                heading="Description"
              />
              <div className="payment-item-total">Amount</div>
            </div>
            <div className="statements-list-wrapper">
              <PaymentList
                payments={filteredPayments}
                headless={true}
                invoices={null}
                caseView={false}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Statements;

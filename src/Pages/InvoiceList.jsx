import { useState, useEffect, useRef } from "react";
import axios from "axios";
import ProfilePic from "../Elements/UI/ProfilePic";
import { formatDateNoTime } from "../helpers/helperFunctions";
import {
  getDurationNumber,
  getDurationFromNumber,
  capitalize,
} from "../helpers/helperFunctions";
import Loader from "../Elements/UI/Loader";
import { useNavigate } from "react-router";

const InvoiceList = () => {
  const [invoiceList, setInvoiceList] = useState([{}]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchInvoices = async () => {
    try {
      await axios.get("/api/getInvoices").then((res) => {
        if (res.status === 200) {
          setInvoiceList(res.data);
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchInvoices();
    }, 100);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
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

  const newBlankInvoice = async () => {
    try {
      axios.post("/api/newInvoice").then((res) => {
        if (res.status === 200) {
          navigate(`/invoice/${res.data.invoiceId}`);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  const createMonthlyInvoices = async () => {
    try {
      axios.post("/api/createMonthlyInvoices").then((res) => {
        if (res.status === 200) {
          if (res.data.length > 0) {
            setInvoiceList((prev) => {
              const updatedById = new Map(
                res.data.map((invoice) => [invoice.invoiceId, invoice]),
              );

              const updatedList = prev.map((invoice) => {
                const incoming = updatedById.get(invoice.invoiceId);
                if (!incoming) return invoice;

                const existingIds = new Set(
                  (invoice.entries ?? []).map((entry) => entry.timeEntryId),
                );

                const newEntries = (incoming.entries ?? []).filter(
                  (entry) => !existingIds.has(entry.timeEntryId),
                );

                if (newEntries.length === 0) return invoice;

                return {
                  ...invoice,
                  entries: [...(invoice.entries ?? []), ...newEntries],
                };
              });

              // Add invoices that didn't exist in the list yet
              const existingIds = new Set(prev.map((inv) => inv.invoiceId));
              const brandNewInvoices = res.data.filter(
                (inv) => !existingIds.has(inv.invoiceId),
              );

              return [...brandNewInvoices, ...updatedList];
            });
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="invoice-page-wrapper">
      <div className="case-list-head invoice-list-head">
        <h2 className="section-heading">Invoices</h2>
        <div className="new-invoice-wrapper">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="new-invoice-button"
          >
            Create Invoice
          </button>
          {showDropdown && (
            <div className="dropdown new-invoice-dropdown" ref={dropdownRef}>
              <div
                onClick={() => createMonthlyInvoices()}
                className="dropdown-item"
              >
                Monthly Invoices
              </div>
              <div onClick={() => newBlankInvoice()} className="dropdown-item">
                Blank Invoice
              </div>
              <div
                onClick={() => navigate("/time-keeper")}
                className="dropdown-item"
              >
                From Time Entries
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="invoice-list">
        <div className="invoice-list-item invoice-list-head">
          <p></p>
          <p>Invoice ID</p>
          <p>Status</p>
          <p>Total Time</p>
          <p>Date Created</p>
        </div>
        {isLoading ? (
          <Loader />
        ) : invoiceList?.length <= 0 ? (
          <div className="no-invoices">
            <i className="fa-solid fa-magnifying-glass"></i>
            <h2>No Invoices Found</h2>
          </div>
        ) : (
          invoiceList?.map((invoice) => {
            const totalTimeNumber = invoice?.entries?.reduce(
              (acc, inv) => acc + getDurationNumber(inv),
              0,
            );
            return (
              <div
                className="invoice-list-item"
                onClick={() => navigate(`/invoice/${invoice.invoiceId}`)}
              >
                <ProfilePic />
                <p>{invoice.invoiceTitle}</p>
                <p
                  className={`invoice-status invoice-${invoice.invoiceStatus}`}
                >
                  {capitalize(invoice.invoiceStatus)}
                </p>
                <p>{getDurationFromNumber(totalTimeNumber)}</p>
                <p>{formatDateNoTime(invoice?.createdAt)}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
export default InvoiceList;

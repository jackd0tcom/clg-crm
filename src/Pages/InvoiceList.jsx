import { useState, useEffect } from "react";
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
  const [isLoading, setIsLoading] = useState(true);
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
    fetchInvoices();
  }, []);

  return (
    <div className="invoice-page-wrapper">
      <div className="case-list-head">
        <h2 className="section-heading">Invoices</h2>
        <button
          className="new-invoice-button"
          onClick={() => navigate("/time-keeper")}
        >
          New Invoice
        </button>
      </div>
      <div className="invoice-list">
        <div className="invoice-list-item invoice-list-head">
          <p></p>
          <p>Title</p>
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
            <p>
              To create an invoice, go the the Time Keeper, filter the entries
              you want to include and hit "Create Invoice"
            </p>
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

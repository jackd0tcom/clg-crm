import { useState, useEffect } from "react";
import axios from "axios";
import ProfilePic from "../Elements/UI/ProfilePic";
import { formatDateNoTime } from "../helpers/helperFunctions";
import {
  getDurationNumber,
  getDurationFromNumber,
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
          <div className="no-invoices">No invoices to show</div>
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
                {invoice.isPaid ? (
                  <p className="invoice-status invoice-draft">Draft</p>
                ) : (
                  <p className="invoice-status invoice-paid">Paid</p>
                )}
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

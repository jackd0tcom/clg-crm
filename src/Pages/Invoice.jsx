import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router";
import Loader from "../Elements/UI/Loader";
import InvoiceItem from "../Elements/Invoice/InvoiceItem";
import CustomChargeItem from "../Elements/Invoice/customChargeItem";
import {
  getAmountOfEntry,
  getRoundedAmountOfEntry,
} from "../helpers/helperFunctions";

const Invoice = () => {
  const { invoiceId } = useParams();
  const [invoiceData, setInvoiceData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [groupedData, setGroupedData] = useState([]);
  const [defaultRate, setDefaultRate] = useState(450);
  const [billedTo, setBilledTo] = useState("");
  const [payTo, setPayTo] = useState("");
  const [isSettingRounding, setIsSettingRounding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const customChargeTotal =
    invoiceData?.customCharges?.length > 0
      ? invoiceData?.customCharges?.reduce((acc, charge) => {
          return acc + charge.amount;
        }, 0)
      : 0;
  const totalAmount =
    Number(customChargeTotal) +
    groupedData?.reduce((acc, group) => {
      const groupTotal = group[1].reduce((innerAcc, entry) => {
        return (
          innerAcc +
          getRoundedAmountOfEntry(
            entry.rate ?? defaultRate,
            entry,
            invoiceData.roundingAmount,
          )
        );
      }, 0);

      return acc + groupTotal;
    }, 0);

  const fetchInvoice = async () => {
    try {
      const res = await axios.get(`/api/getInvoice/${invoiceId}`);
      if (res.status === 200) {
        const data = res.data;
        setInvoiceData(data);
        setDefaultRate(data.settings.defaultRate);
        setPayTo(data.settings.payTo);

        const entries = data?.entries ?? [];
        const byProject = entries.reduce((acc, entry) => {
          const project = entry.case?.title || entry.task?.title || "Untitled";
          if (!acc[project]) acc[project] = [];
          acc[project].push(entry);
          return acc;
        }, {});
        setGroupedData(Object.entries(byProject));

        setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddCustomCharge = () => {
    const currentData = invoiceData;
    setInvoiceData({
      ...currentData,
      customCharges: [
        ...(currentData.customCharges ?? []),
        {
          chargeId: null,
          amount: 0,
          description: "",
        },
      ],
    });
  };

  useEffect(() => {
    if (invoiceId !== 0) {
      fetchInvoice();
    } else setIsLoading(false);
  }, [invoiceId]);

  const handleSaveInvoice = async () => {
    try {
      setIsSaving(true);
      await axios.post("/api/saveInvoice", { invoiceData }).then((res) => {
        if (res.status === 200) {
          console.log(res.data);
          setIsSaving(false);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="invoice-page-wrapper">
      <div className="page-header">
        <h2 className="section-heading">Invoice</h2>
        <button
          onClick={() => handleSaveInvoice()}
          className="invoice-save-button"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
      <div className="invoice-info-wrapper">
        <div className="billing-wrapper">
          <p>Billed to:</p>
          <textarea
            name="billed-to"
            id="billed-to"
            value={billedTo}
            onChange={(e) => setBilledTo(e.target.value)}
          ></textarea>
        </div>
        <div className="billing-wrapper">
          <p>Pay to:</p>
          <textarea
            name="pay-to"
            id="pay-to"
            value={payTo}
            onChange={(e) => setPayTo(e.target.value)}
          ></textarea>
        </div>
        <div className="rate-wrapper">
          <p>Default Rate:</p>
          <input
            type="number"
            value={defaultRate}
            onChange={(e) => setDefaultRate(e.target.value)}
          />
        </div>
        <div className="rounding-wrapper">
          <button
            onClick={() => setIsSettingRounding(true)}
            className="rounding-button"
          >
            Rounding {invoiceData.roundingAmount} min
          </button>
          {isSettingRounding && (
            <div className="rounding-dropdown">
              <p
                onClick={() => {
                  setIsSettingRounding(false);
                  setInvoiceData({
                    ...invoiceData,
                    roundingAmount: 0,
                  });
                }}
                className="rounding-dropdown-item"
              >
                0 Minutes
              </p>
              <p
                onClick={() => {
                  setIsSettingRounding(false);
                  setInvoiceData({
                    ...invoiceData,
                    roundingAmount: 15,
                  });
                }}
                className="rounding-dropdown-item"
              >
                15 Minutes
              </p>
              <p
                onClick={() => {
                  setIsSettingRounding(false);
                  setInvoiceData({
                    ...invoiceData,
                    roundingAmount: 30,
                  });
                }}
                className="rounding-dropdown-item"
              >
                30 Minutes
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="invoice-items-list">
        <div className="invoice-items-list-item invoice-list-head">
          <p>Description</p>
          <p>Rate</p>
          <p>Time</p>
          <div className="amount-wrapper">
            <p>Amount</p>
          </div>
        </div>
        {isLoading ? (
          <Loader />
        ) : groupedData?.length > 0 ? (
          <>
            {groupedData?.map((project, projectIndex) => (
              <div className="invoice-project-item">
                <div className="invoice-project-item-head">
                  <p>{project[0]}</p>
                </div>
                {project[1].map((item, index) => (
                  <InvoiceItem
                    key={`${projectIndex}-${index}`}
                    setGroupedData={setGroupedData}
                    groupedData={groupedData}
                    item={item}
                    defaultRate={defaultRate}
                    projectIndex={projectIndex}
                    index={index}
                    rounding={invoiceData.roundingAmount}
                  />
                ))}
              </div>
            ))}
            {invoiceData?.customCharges?.map((charge, index) => (
              <CustomChargeItem
                item={charge}
                index={index}
                invoiceData={invoiceData}
                setInvoiceData={setInvoiceData}
              />
            ))}
            <div
              onClick={() => handleAddCustomCharge()}
              className="add-custom-item-wrapper"
            >
              <p>+ Add Custom Charge</p>
            </div>
          </>
        ) : (
          <div className="no-invoice-items">No items to show</div>
        )}
        <div className="invoice-items-list-item invoice-list-footer">
          <p>Subtotal</p>
          <p></p>
          <p></p>
          <div className="amount-wrapper">
            <p>${totalAmount}</p>
          </div>
        </div>
        <div className="total-wrapper">
          <p>${totalAmount}</p>
        </div>
      </div>
    </div>
  );
};
export default Invoice;

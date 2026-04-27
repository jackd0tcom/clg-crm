import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router";
import Loader from "../Elements/UI/Loader";
import InvoiceItem from "../Elements/Invoice/InvoiceItem";
import CustomChargeItem from "../Elements/Invoice/customChargeItem";
import {
  getAmountOfEntry,
  getRoundedAmountOfEntry,
  capitalize,
} from "../helpers/helperFunctions";
import PDFInvoice from "../Elements/PDF/PDFInvoice";

const Invoice = () => {
  const { invoiceId } = useParams();
  const [invoiceData, setInvoiceData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [entries, setEntries] = useState([{}]);
  const [groupedData, setGroupedData] = useState([]);
  const [defaultRate, setDefaultRate] = useState(0);
  const [billedTo, setBilledTo] = useState("");
  const [payTo, setPayTo] = useState("");
  const [isSettingRounding, setIsSettingRounding] = useState(false);
  const [savingStatus, setSavingStatus] = useState("Save");
  const [status, setStatus] = useState("Draft");
  const [isViewing, setIsViewing] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [somethingToSave, setSomethingToSave] = useState(false);
  const dropdownRef = useRef(null);
  const statusRef = useRef(null);
  const customChargeTotal =
    invoiceData?.customCharges?.length > 0
      ? invoiceData?.customCharges?.reduce((acc, charge) => {
          return acc + Number(charge.amount);
        }, 0)
      : 0;
  const totalAmount =
    Number(customChargeTotal) +
      Number(
        groupedData?.length > 0 &&
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
          }, 0),
      ) ?? 0;

  const fetchInvoice = async () => {
    try {
      const res = await axios.get(`/api/getInvoice/${invoiceId}`);
      if (res.status === 200) {
        const data = res.data;
        setInvoiceData(data);
        setDefaultRate(data.settings.defaultRate);
        setPayTo(data.payTo ?? data.settings.payTo ?? "");
        const defaultClient = data.entries[0]?.case
          ? data.entries[0].case?.people[0]
          : null;
        const defaultBillTo = defaultClient
          ? `${defaultClient.firstName ?? ""} ${defaultClient.lastName ?? ""}\n${defaultClient.address ?? ""} ${defaultClient.city ?? ""}, ${defaultClient.state ?? ""} ${defaultClient.zip ?? ""}\n${defaultClient.phoneNumber ?? ""}  `
          : "";
        setBilledTo(data.billTo ?? defaultBillTo ?? "");
        setStatus(data.invoiceStatus);

        const entries = data?.entries ?? [];
        setEntries(entries ?? []);

        const byProject = entries?.reduce((acc, entry) => {
          const project = entry.case?.title || entry.task?.title || "Untitled";
          if (!acc[project]) acc[project] = [];
          acc[project].push(entry);
          return acc;
        }, {});
        if (entries?.length > 0) {
          setGroupedData(Object.entries(byProject));
        } else setGroupedData();

        setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsSettingRounding(false);
      }
    };

    if (isSettingRounding) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSettingRounding]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusRef.current && !statusRef.current.contains(event.target)) {
        setShowStatusDropdown(false);
      }
    };

    if (showStatusDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showStatusDropdown]);

  const handleAddCustomCharge = () => {
    setSomethingToSave(true);
    setInvoiceData((prev) => ({
      ...prev,
      customCharges: [
        ...(prev.customCharges ?? []),
        {
          chargeId: null,
          clientKey: crypto.randomUUID(),
          amount: 0,
          description: "",
        },
      ],
    }));
  };

  useEffect(() => {
    if (invoiceId !== 0) {
      fetchInvoice();
    } else setIsLoading(false);
  }, [invoiceId]);

  const handleSaveInvoice = async () => {
    try {
      setSavingStatus("Saving...");
      const updatedInvoiceData = {
        ...invoiceData,
        billTo: billedTo,
        payTo: payTo,
      };
      await axios
        .post("/api/saveInvoice", { invoiceData: updatedInvoiceData })
        .then((res) => {
          if (res.status === 200) {
            setTimeout(() => {
              setSavingStatus("Saved");
            }, 800);
            setTimeout(() => {
              setSavingStatus("Save");
              setSomethingToSave(false);
            }, 1800);
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  const handleChangeStatus = async (status) => {
    const entryIds = entries.map((entry) => entry.timeEntryId);
    try {
      setSavingStatus("Saving...");
      await axios
        .post("/api/updateInvoiceStatus", { invoiceId, status, entryIds })
        .then((res) => {
          if (res.status === 200) {
            setInvoiceData({ ...invoiceData, invoiceStatus: status });
            setStatus(status);
            const entries = res.data.entries;
            setEntries(entries);

            const byProject = entries.reduce((acc, entry) => {
              const project =
                entry.case?.title || entry.task?.title || "Untitled";
              if (!acc[project]) acc[project] = [];
              acc[project].push(entry);
              return acc;
            }, {});
            setGroupedData(Object.entries(byProject));

            setTimeout(() => {
              setSavingStatus("Saved");
            }, 800);
            setTimeout(() => {
              setSavingStatus("Save");
              setSomethingToSave(false);
            }, 1800);
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
        <div className="invoice-id-wrapper">
          <p>Invoice ID:</p>
          <input
            type="text"
            className="invoice-id-input"
            value={invoiceData.invoiceTitle}
            onChange={(e) => {
              setSomethingToSave(true);
              setInvoiceData({ ...invoiceData, invoiceTitle: e.target.value });
            }}
          />
          {!isViewing && (
            <div className="invoice-status-wrapper">
              <button
                disabled={status === "paid"}
                className={`invoice-status-button invoice-${status}`}
                onClick={() => {
                  setShowStatusDropdown(!showStatusDropdown);
                }}
              >
                {capitalize(status)}
              </button>
              {showStatusDropdown && (
                <div
                  className="dropdown invoice-status-dropdown"
                  ref={statusRef}
                >
                  <div
                    onClick={() => {
                      handleChangeStatus("draft");
                      setShowStatusDropdown(false);
                    }}
                    className="dropdown-item invoice-status-dropdown-item"
                  >
                    Draft
                  </div>
                  <div
                    onClick={() => {
                      handleChangeStatus("posted");
                      setShowStatusDropdown(false);
                    }}
                    className="dropdown-item invoice-status-dropdown-item"
                  >
                    Posted
                  </div>
                  <div
                    onClick={() => {
                      handleChangeStatus("paid");
                      setShowStatusDropdown(false);
                    }}
                    className="dropdown-item invoice-status-dropdown-item"
                  >
                    Paid
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="invoice-buttons-wrapper">
          {!isViewing && (
            <button
              disabled={!somethingToSave}
              onClick={() => handleSaveInvoice()}
              className={
                savingStatus !== "Save"
                  ? "invoice-save-button saving"
                  : "invoice-save-button"
              }
            >
              {savingStatus}
              {savingStatus === "Save"
                ? somethingToSave && <i class="fa-solid fa-floppy-disk"></i>
                : savingStatus === "Saved" && <i class="fa-solid fa-check"></i>}
            </button>
          )}
          <button
            onClick={() => setIsViewing(!isViewing)}
            className="invoice-view-button"
          >
            {isViewing ? "Close PDF" : "View PDF"}
          </button>
        </div>
      </div>
      {isViewing ? (
        <PDFInvoice
          invoiceData={invoiceData}
          billTo={billedTo}
          payTo={payTo}
          defaultRate={defaultRate}
        />
      ) : (
        <div className="invoice-body">
          <div className="invoice-info-wrapper">
            <div className="billing-wrapper">
              <p>Billed to:</p>
              <textarea
                name="billed-to"
                id="billed-to"
                disabled={status !== "draft"}
                value={billedTo}
                onChange={(e) => {
                  if (e.target.value !== billedTo) {
                    setSomethingToSave(true);
                  }
                  setBilledTo(e.target.value);
                }}
              ></textarea>
            </div>
            <div className="billing-wrapper">
              <p>Pay to:</p>
              <textarea
                name="pay-to"
                id="pay-to"
                value={payTo}
                disabled={status !== "draft"}
                onChange={(e) => {
                  if (e.target.value !== payTo) {
                    setSomethingToSave(true);
                  }
                  setPayTo(e.target.value);
                }}
              ></textarea>
            </div>
            <div className="billing-wrapper">
              <p>Default Rate:</p>
              <input
                type="number"
                value={defaultRate}
                disabled={status !== "draft"}
                onChange={(e) => setDefaultRate(Number(e.target.value))}
              />
            </div>
            <div className="billing-wrapper">
              <p>Rounding</p>
              <div>
                <button
                  onClick={() => {
                    if (status === "draft") {
                      setIsSettingRounding(true);
                    }
                  }}
                  disabled={status !== "draft"}
                  className="rounding-button"
                >
                  {invoiceData.roundingAmount} min
                </button>
              </div>
              {isSettingRounding && (
                <div className="dropdown rounding-dropdown" ref={dropdownRef}>
                  <p
                    onClick={() => {
                      setIsSettingRounding(false);
                      setInvoiceData({
                        ...invoiceData,
                        roundingAmount: 0,
                      });
                    }}
                    className="dropdown-item rounding-dropdown-item"
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
                    className="dropdown-item rounding-dropdown-item"
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
                    className="dropdown-item rounding-dropdown-item"
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
              <p>Status</p>
              <p>Rate</p>
              <p>Time</p>
              <div className="amount-wrapper">
                <p>Amount</p>
              </div>
            </div>
            {isLoading ? (
              <Loader />
            ) : (
              <>
                {groupedData?.map((project, projectIndex) => (
                  <div className="invoice-project-item">
                    <div className="invoice-project-item-head">
                      <i className="fa-solid fa-briefcase"></i>
                      <p>{project[0]}</p>
                    </div>
                    {project[1].map((item, index) => (
                      <InvoiceItem
                        setSomethingToSave={setSomethingToSave}
                        key={`${projectIndex}-${index}`}
                        setGroupedData={setGroupedData}
                        groupedData={groupedData}
                        item={item}
                        defaultRate={defaultRate}
                        projectIndex={projectIndex}
                        index={index}
                        rounding={invoiceData.roundingAmount}
                        status={status}
                      />
                    ))}
                  </div>
                ))}
                {invoiceData?.customCharges?.map((charge, index) => (
                  <CustomChargeItem
                    setSomethingToSave={setSomethingToSave}
                    key={charge.chargeId ?? charge.clientKey}
                    item={charge}
                    index={index}
                    invoiceData={invoiceData}
                    setInvoiceData={setInvoiceData}
                    status={status}
                  />
                ))}
              </>
            )}
            {status === "draft" && (
              <div
                onClick={() => handleAddCustomCharge()}
                className="add-custom-item-wrapper"
              >
                <p>+ Add Custom Charge</p>
              </div>
            )}
            <div className="invoice-items-list-item invoice-list-footer">
              <p>Subtotal</p>
              <p></p>
              <p></p>
              <p></p>
              <div className="amount-wrapper">
                <p>${totalAmount}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoice;

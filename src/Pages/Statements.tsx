import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import Loader from "../Elements/UI/Loader";
import FilterDropdown from "../Elements/UI/FilterDropdown";
import { usePersistedFilter } from "../Hooks/usePersistedFilter";
import { useSelector } from "react-redux";
import PaymentList from "../Elements/Statements/PaymentList";
import { buildFilters } from "../helpers/helperFunctions";

const Statements = () => {
  const [paymentList, setPaymentList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const userStore = useSelector((state: any) => state.user);
  const [dates, setDates] = useState<any>([]);
  const [clients, setClients] = useState<any>([]);
  const [description, setDescription] = useState<any>([]);
  const [filter, setFilter] = usePersistedFilter(
    "statements",
    userStore.userId,
    {
      sort: "",
      date: [],
      client: [],
      description: [],
      direction: "up",
    },
  );

  const fetchPayments = async () => {
    try {
      await axios.get("/api/getPayments").then((res: any) => {
        if (res.status === 200) {
          setPaymentList(res.data);
          console.log(res.data);
          setDates(
            buildFilters(
              res.data,
              (item: any) => item.paidDate?.slice(0, 7), // unique key: "2024-03"
              (item: any) => {
                const [year, month] = item.paidDate.split("-");
                return `${month}/${year}`; // display: "03/2024"
              },
            ),
          );
          setClients(
            buildFilters(res.data, "personId", (p: any) =>
              `${p.person?.firstName ?? ""} ${p.person?.lastName ?? ""}`.trim(),
            ),
          );
          setDescription(buildFilters(res.data, "description", "description"));
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

  const filteredPayments = useMemo(() => {
    let data = paymentList;

    data = data.filter((payment: any) => {
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

  return (
    <div className="statements-page-wrapper">
      <div className="page-header">
        <h2 className="section-heading">Statements</h2>
      </div>
      <div className="statements-page-body">
        {isLoading ? (
          <Loader />
        ) : (
          <div className="statements-list">
            <div className="payment-item statement-list-head">
              <FilterDropdown
                filter={filter}
                setFilter={setFilter}
                options={dates}
                array={true}
                heading="Date"
              />
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

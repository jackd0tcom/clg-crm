import PaymentItem from "./PaymentItem";
import StatementsFooter from "./StatementsFooter";

interface props {
  payments: any;
  headless: boolean;
  invoices: any;
  caseView: boolean;
  total?: number;
}

const PaymentList = ({
  payments,
  headless,
  invoices,
  caseView,
  total,
}: props) => {
  let items = payments;
  if (invoices) {
    const combined = [...payments, ...invoices];
    const sorted = combined.sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    items = sorted;
  }

  return (
    <div
      className={
        headless ? "payment-list-wrapper no-top-radius" : "payment-list-wrapper"
      }
    >
      {!headless && (
        <div
          className={
            caseView
              ? "payment-item payment-list-head case-payments-head"
              : "payment-item payment-list-head"
          }
        >
          <div>Date</div>
          <div>Client</div>
          <div>Description</div>
          <div className="payment-item-total">Amount</div>
        </div>
      )}
      <div
        className={
          caseView
            ? "payment-items-wrapper case-payments-wrapper"
            : "payment-items-wrapper"
        }
      >
        {items?.map((payment: any) => (
          <PaymentItem payment={payment} />
        ))}
      </div>
      <StatementsFooter payments={items} total={total} />
    </div>
  );
};
export default PaymentList;
